import { Prisma } from "@prisma/client";

export function getSettings<T>(settings: Prisma.JsonValue): T {
    return settings as T;
}