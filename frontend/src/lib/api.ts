const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type DeviceSummary = {
  deviceId: string;
  name: string;
  status: string;
  lastSeen?: string;
};

export type TelemetrySnapshot = {
  temperature?: number;
  humidity?: number;
  light?: number;
  doorStatus?: "LOCKED" | "UNLOCKED";
  fanStatus?: "ON" | "OFF";
  fanSpeed?: number;
  updatedAt?: string;
};

type LoginApiResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: {
    id?: number;
    username?: string;
    role?: string;
  };
};

type ApiOptions = Omit<RequestInit, "headers"> & {
  token?: string;
  headers?: Record<string, string>;
};

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asDoorStatus(value: unknown): "LOCKED" | "UNLOCKED" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "LOCKED" || normalized === "UNLOCKED") {
    return normalized;
  }
  return undefined;
}

function asFanStatus(value: unknown): "ON" | "OFF" | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "ON" || normalized === "OFF") {
    return normalized;
  }
  return undefined;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : undefined) ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function mapDevice(item: unknown): DeviceSummary | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const raw = item as Record<string, unknown>;

  const deviceId =
    asString(raw.deviceId) ?? asString(raw.device_id) ?? asString(raw.id) ?? asString(raw.device);

  if (!deviceId) {
    return null;
  }

  return {
    deviceId,
    name: asString(raw.name) ?? deviceId,
    status: asString(raw.status) ?? "unknown",
    lastSeen: asString(raw.lastSeen) ?? asString(raw.last_seen),
  };
}

function normalizeDevicesResponse(payload: unknown): DeviceSummary[] {
  if (Array.isArray(payload)) {
    return payload.map(mapDevice).filter((item): item is DeviceSummary => item !== null);
  }

  if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;
    if (Array.isArray(raw.devices)) {
      return raw.devices.map(mapDevice).filter((item): item is DeviceSummary => item !== null);
    }
  }

  return [];
}

function telemetryFromObject(obj: Record<string, unknown>): TelemetrySnapshot {
  return {
    temperature: asNumber(obj.temperature),
    humidity: asNumber(obj.humidity),
    light: asNumber(obj.light),
    doorStatus: asDoorStatus(obj.doorStatus) ?? asDoorStatus(obj.door_status),
    fanStatus: asFanStatus(obj.fanStatus) ?? asFanStatus(obj.fan_status),
    fanSpeed: asNumber(obj.fanSpeed) ?? asNumber(obj.fan_speed),
    updatedAt: asString(obj.updatedAt) ?? asString(obj.timestamp) ?? asString(obj.created_at),
  };
}

function telemetryFromLogs(items: Array<Record<string, unknown>>): TelemetrySnapshot {
  const snapshot: TelemetrySnapshot = {};

  for (const item of items) {
    const sensorTypeRaw = asString(item.sensor_type) ?? asString(item.sensorType);
    if (!sensorTypeRaw) {
      continue;
    }
    const sensorType = sensorTypeRaw.trim().toLowerCase();
    const value = asNumber(item.value);

    if (sensorType === "temperature") {
      snapshot.temperature = value;
    } else if (sensorType === "humidity") {
      snapshot.humidity = value;
    } else if (sensorType === "light") {
      snapshot.light = value;
    } else if (sensorType === "fan_speed") {
      snapshot.fanSpeed = value;
    } else if (sensorType === "fan_status") {
      snapshot.fanStatus = asFanStatus(item.value);
    } else if (sensorType === "door_status") {
      snapshot.doorStatus = asDoorStatus(item.value);
    }

    snapshot.updatedAt = asString(item.timestamp) ?? snapshot.updatedAt;
  }

  return snapshot;
}

function normalizeTelemetryResponse(payload: unknown): TelemetrySnapshot {
  if (Array.isArray(payload)) {
    const items = payload.filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
    );
    return telemetryFromLogs(items);
  }

  if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;

    if (Array.isArray(raw.telemetry)) {
      const items = raw.telemetry.filter((item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
      );
      return telemetryFromLogs(items);
    }

    if (raw.latest && typeof raw.latest === "object") {
      return telemetryFromObject(raw.latest as Record<string, unknown>);
    }

    return telemetryFromObject(raw);
  }

  return {};
}

export async function loginRequest(username: string, password: string): Promise<{ token: string; username: string }> {
  const payload = await request<LoginApiResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const token = payload.token ?? payload.accessToken ?? payload.jwt;
  if (!token) {
    throw new Error("Login succeeded but token is missing in response.");
  }

  return {
    token,
    username: payload.user?.username ?? username,
  };
}

export async function fetchDevices(token: string): Promise<DeviceSummary[]> {
  const payload = await request<unknown>("/api/devices", { token });
  return normalizeDevicesResponse(payload);
}

export async function fetchLatestTelemetry(token: string): Promise<TelemetrySnapshot> {
  const payload = await request<unknown>("/api/telemetry?limit=30", { token });
  return normalizeTelemetryResponse(payload);
}

export async function sendControlCommand(
  token: string,
  params: {
    deviceId: string;
    controlType: "light" | "door" | "fan";
    command: string;
  },
): Promise<void> {
  await request<unknown>("/api/control", {
    token,
    method: "POST",
    body: JSON.stringify({
      deviceId: params.deviceId,
      controlType: params.controlType,
      command: params.command,
      action: params.controlType,
      payload: params.command,
      source: "web-dashboard",
    }),
  });
}

export function getDefaultDeviceId(): string {
  return process.env.NEXT_PUBLIC_DEVICE_ID ?? "simplehome-yolobit-01";
}
