"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  DeviceSummary,
  TelemetrySnapshot,
  fetchDevices,
  fetchLatestTelemetry,
  getDefaultDeviceId,
  sendControlCommand,
} from "@/lib/api";
import styles from "./page.module.css";

const POLL_INTERVAL_MS = 5000;

function valueOrDash(value: number | undefined, suffix = "") {
  return value !== undefined ? `${value}${suffix}` : "--";
}

function telemetryStatus(snapshot: TelemetrySnapshot): string {
  if (snapshot.temperature !== undefined && snapshot.temperature >= 32) {
    return "warning";
  }
  if (snapshot.humidity !== undefined && snapshot.humidity >= 80) {
    return "warning";
  }
  return "ok";
}

export default function DashboardPage() {
  const router = useRouter();
  const { isReady, isAuthenticated, token, username, signOut } = useAuth();

  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({});
  const [selectedDeviceId, setSelectedDeviceId] = useState(getDefaultDeviceId());
  const [fanSpeedInput, setFanSpeedInput] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isAuthenticated, router]);

  const activeDeviceId = useMemo(() => {
    if (devices.length === 0) {
      return selectedDeviceId;
    }
    const hasCurrent = devices.some((item) => item.deviceId === selectedDeviceId);
    return hasCurrent ? selectedDeviceId : devices[0].deviceId;
  }, [devices, selectedDeviceId]);

  const loadDashboardData = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setError(null);
      const [deviceData, telemetryData] = await Promise.all([fetchDevices(token), fetchLatestTelemetry(token)]);
      setDevices(deviceData);
      setTelemetry(telemetryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const firstLoadTimer = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    const timer = window.setInterval(() => {
      void loadDashboardData();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(firstLoadTimer);
      window.clearInterval(timer);
    };
  }, [isAuthenticated, token, loadDashboardData]);

  async function runControlCommand(controlType: "light" | "door" | "fan", command: string) {
    if (!token) {
      return;
    }

    setIsSending(true);
    setError(null);
    setInfoMessage(null);

    try {
      await sendControlCommand(token, {
        deviceId: activeDeviceId,
        controlType,
        command,
      });
      setInfoMessage(`Sent ${controlType.toUpperCase()} command: ${command}`);
      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send control command.");
    } finally {
      setIsSending(false);
    }
  }

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  const connectionState = useMemo(() => {
    if (devices.length === 0) {
      return "No device data";
    }

    const matched = devices.find((item) => item.deviceId === activeDeviceId);
    return matched ? `${matched.name} (${matched.status})` : "Device unknown";
  }, [devices, activeDeviceId]);

  const healthClass = telemetryStatus(telemetry) === "warning" ? styles.warn : styles.ok;

  if (!isReady || !isAuthenticated) {
    return (
      <main className="main-container" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <p>Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className={`${styles.page} main-container`}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <h1 className={`${styles.title} page-title`}>SimpleHome Dashboard</h1>
          <p className={styles.subtitle}>Welcome {username ?? "User"}. Polling telemetry every 5 seconds.</p>
        </div>

        <div className={styles.topActions}>
          <select
            className={styles.select}
            value={activeDeviceId}
            onChange={(event) => setSelectedDeviceId(event.target.value)}
          >
            {devices.length === 0 ? <option value={selectedDeviceId}>{selectedDeviceId}</option> : null}
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.name} ({device.status})
              </option>
            ))}
          </select>
          <button className={styles.outlineBtn} onClick={() => void loadDashboardData()} type="button">
            Refresh
          </button>
          <button className={styles.ghostBtn} onClick={handleLogout} type="button">
            Sign out
          </button>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {infoMessage ? <p className={styles.info}>{infoMessage}</p> : null}

      <section className={styles.grid}>
        <article className={styles.card}>
          <p className={styles.cardLabel}>Temperature</p>
          <p className={styles.cardValue}>{valueOrDash(telemetry.temperature, " °C")}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Humidity</p>
          <p className={styles.cardValue}>{valueOrDash(telemetry.humidity, " %")}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Light</p>
          <p className={styles.cardValue}>{valueOrDash(telemetry.light)}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Door</p>
          <p className={styles.cardValue}>{telemetry.doorStatus ?? "--"}</p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Fan</p>
          <p className={styles.cardValue}>
            {telemetry.fanStatus ?? "--"} {telemetry.fanSpeed !== undefined ? `(${telemetry.fanSpeed}%)` : ""}
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>System Health</p>
          <p className={`${styles.cardValue} ${healthClass}`}>
            {isLoading ? "Loading" : telemetryStatus(telemetry) === "warning" ? "Warning" : "Normal"}
          </p>
          <p className={styles.note}>{connectionState}</p>
        </article>
      </section>

      <section className={styles.controls}>
        <article className={styles.controlCard}>
          <h2 className={styles.controlTitle}>Light Control</h2>
          <div className={styles.row}>
            <button
              className={styles.primaryBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "AUTO")}
              type="button"
            >
              AUTO
            </button>
            <button
              className={styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "ON")}
              type="button"
            >
              ON
            </button>
            <button
              className={styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "OFF")}
              type="button"
            >
              OFF
            </button>
          </div>
        </article>

        <article className={styles.controlCard}>
          <h2 className={styles.controlTitle}>Door Control</h2>
          <div className={styles.row}>
            <button
              className={styles.primaryBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("door", "LOCK")}
              type="button"
            >
              LOCK
            </button>
            <button
              className={styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("door", "UNLOCK")}
              type="button"
            >
              UNLOCK
            </button>
          </div>
        </article>

        <article className={styles.controlCard}>
          <h2 className={styles.controlTitle}>Fan Control</h2>
          <div className={styles.row}>
            <button
              className={styles.primaryBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", "ON")}
              type="button"
            >
              ON
            </button>
            <button
              className={styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", "OFF")}
              type="button"
            >
              OFF
            </button>
          </div>

          <input
            className={styles.slider}
            type="range"
            min={0}
            max={100}
            value={fanSpeedInput}
            onChange={(event) => setFanSpeedInput(Number(event.target.value))}
          />
          <p className={styles.note}>Fan speed: {fanSpeedInput}%</p>

          <div className={styles.row}>
            <button
              className={styles.primaryBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", String(fanSpeedInput))}
              type="button"
            >
              Set Speed
            </button>
            <button
              className={styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", `SPEED:${fanSpeedInput}`)}
              type="button"
            >
              Set SPEED:{fanSpeedInput}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
