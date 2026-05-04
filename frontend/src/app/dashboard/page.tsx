"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";
import {
  Thermometer,
  Droplets,
  Sun,
  DoorOpen,
  Fan,
  Activity,
  LogOut,
  RefreshCw,
  Moon,
  Monitor,
  Lightbulb,
  Lock,
  Unlock,
  Wind
} from "lucide-react";
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
  const { theme, setTheme } = useTheme();

  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({});
  const [selectedDeviceId, setSelectedDeviceId] = useState(getDefaultDeviceId());
  const [fanSpeedInput, setFanSpeedInput] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track active commands for dynamic button styling
  const [activeCommands, setActiveCommands] = useState<Record<string, string>>({
    light: "AUTO",
    door: "LOCK",
    fan: "SPEED"
  });

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
    if (!token) return;
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
    if (!isAuthenticated || !token) return;
    const firstLoadTimer = window.setTimeout(() => void loadDashboardData(), 0);
    const timer = window.setInterval(() => void loadDashboardData(), POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(firstLoadTimer);
      window.clearInterval(timer);
    };
  }, [isAuthenticated, token, loadDashboardData]);

  async function runControlCommand(controlType: "light" | "door" | "fan", command: string) {
    if (!token) return;
    setIsSending(true);
    setError(null);
    
    // Update local state to reflect which command is active
    const cmdKey = command.startsWith("SPEED") ? "SPEED" : command;
    setActiveCommands((prev) => ({ ...prev, [controlType]: cmdKey }));

    try {
      await sendControlCommand(token, { deviceId: activeDeviceId, controlType, command });
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

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const renderThemeIcon = () => {
    if (!theme) return <Monitor size={20} />;
    if (theme === "light") return <Sun size={20} />;
    if (theme === "dark") return <Moon size={20} />;
    return <Monitor size={20} />;
  };

  const connectionState = useMemo(() => {
    if (devices.length === 0) return "No device data";
    const matched = devices.find((item) => item.deviceId === activeDeviceId);
    return matched ? `${matched.name} (${matched.status})` : "Device unknown";
  }, [devices, activeDeviceId]);

  const tStatus = telemetryStatus(telemetry);
  const healthClass = tStatus === "warning" ? styles.warn : styles.ok;

  if (!isReady || !isAuthenticated) {
    return (
      <main className="main-container" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className={`${styles.page} main-container`}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>SimpleHome Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, {username ?? "Admin"}. Devices synced live.</p>
        </div>

        <div className={styles.topActions}>
          <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle Theme" type="button">
            {renderThemeIcon()}
          </button>
          
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
          
          <button className={styles.primaryBtn} onClick={() => void loadDashboardData()} type="button">
            <RefreshCw size={18} /> <span className={styles.hideMobile}>Refresh</span>
          </button>
          <button className={styles.ghostBtn} onClick={handleLogout} type="button">
            <LogOut size={18} /> <span className={styles.hideMobile}>Sign out</span>
          </button>
        </div>
      </header>

      {error ? <div className={styles.error}>{error}</div> : null}

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <Thermometer size={24} className={`${styles.cardIcon} ${styles.iconTemp}`} />
            <p className={styles.cardLabel}>Temperature</p>
          </div>
          <p className={styles.cardValue}>{valueOrDash(telemetry.temperature, "°")}</p>
        </article>

        <article className={styles.card}>
           <div className={styles.cardHeader}>
            <Droplets size={24} className={`${styles.cardIcon} ${styles.iconHumi}`} />
            <p className={styles.cardLabel}>Humidity</p>
          </div>
          <p className={styles.cardValue}>{valueOrDash(telemetry.humidity, "%")}</p>
        </article>

        <article className={styles.card}>
           <div className={styles.cardHeader}>
            <Sun size={24} className={`${styles.cardIcon} ${styles.iconLight}`} />
            <p className={styles.cardLabel}>Light Level</p>
          </div>
          <p className={styles.cardValue}>{valueOrDash(telemetry.light)}</p>
        </article>

        <article className={styles.card}>
           <div className={styles.cardHeader}>
            <DoorOpen size={24} className={`${styles.cardIcon} ${styles.iconDoor}`} />
            <p className={styles.cardLabel}>Door Status</p>
          </div>
          <p className={styles.cardValue}>{telemetry.doorStatus ?? "--"}</p>
        </article>

        <article className={styles.card}>
           <div className={styles.cardHeader}>
            <Fan size={24} className={`${styles.cardIcon} ${styles.iconFan}`} />
            <p className={styles.cardLabel}>Fan Settings</p>
          </div>
          <p className={styles.cardValue}>
            {telemetry.fanStatus ?? "--"} 
            <span style={{fontSize: "1.2rem", marginLeft: "10px", color: "var(--text-muted)", fontWeight: "normal"}}>
              {telemetry.fanSpeed !== undefined ? `${telemetry.fanSpeed}%` : ""}
            </span>
          </p>
        </article>

        <article className={styles.card}>
           <div className={styles.cardHeader}>
            <Activity size={24} className={`${styles.cardIcon} ${tStatus === "warning" ? styles.iconHealthWarn : styles.iconHealth}`} />
            <p className={styles.cardLabel}>System Health</p>
          </div>
          <p className={`${styles.cardValue} ${healthClass}`}>
            {isLoading ? "..." : tStatus === "warning" ? "Warning" : "Online"}
          </p>
          <p className={styles.note} style={{marginTop: "auto"}}>{connectionState}</p>
        </article>
      </section>

      <section className={styles.controls}>
        <article className={styles.controlCard}>
          <div className={styles.controlHeader}>
            <Lightbulb size={26} />
            <h2 className={styles.controlTitle}>Lighting</h2>
          </div>
          <div className={styles.row}>
            <button
              className={activeCommands.light === "AUTO" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "AUTO")}
              type="button"
            >
              AUTO
            </button>
            <button
              className={activeCommands.light === "ON" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "ON")}
              type="button"
            >
              ON
            </button>
            <button
              className={activeCommands.light === "OFF" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("light", "OFF")}
              type="button"
            >
              OFF
            </button>
          </div>
        </article>

        <article className={styles.controlCard}>
          <div className={styles.controlHeader}>
            <DoorOpen size={26} />
            <h2 className={styles.controlTitle}>Security Door</h2>
          </div>
          <div className={styles.row}>
            <button
              className={activeCommands.door === "LOCK" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("door", "LOCK")}
              type="button"
            >
             <Lock size={18} /> LOCK
            </button>
            <button
              className={activeCommands.door === "UNLOCK" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("door", "UNLOCK")}
              type="button"
            >
             <Unlock size={18} /> UNLOCK
            </button>
          </div>
        </article>

        <article className={styles.controlCard} style={{gridColumn: "1 / -1"}}>
          <div className={styles.controlHeader}>
            <Wind size={26} />
            <h2 className={styles.controlTitle}>Ventilation Fan Control</h2>
          </div>
          
          <div className={styles.row}>
            <button
              className={activeCommands.fan === "ON" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", "ON")}
              type="button"
            >
              TURN ON
            </button>
            <button
              className={activeCommands.fan === "OFF" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", "OFF")}
              type="button"
            >
              TURN OFF
            </button>
            <button
              className={activeCommands.fan === "SPEED" ? styles.primaryBtn : styles.outlineBtn}
              disabled={isSending}
              onClick={() => void runControlCommand("fan", `SPEED:${fanSpeedInput}`)}
              type="button"
            >
              SET SPEED TO {fanSpeedInput}%
            </button>
          </div>

          <div style={{padding: "1rem 0"}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <span className={styles.note} style={{margin: 0}}>Low</span>
              <span className={styles.note} style={{margin: 0, fontWeight: "bold", color: "var(--brand)"}}>{fanSpeedInput}% Selected</span>
              <span className={styles.note} style={{margin: 0}}>Max</span>
            </div>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={100}
              value={fanSpeedInput}
              onChange={(event) => setFanSpeedInput(Number(event.target.value))}
            />
          </div>
        </article>
      </section>
    </main>
  );
}
