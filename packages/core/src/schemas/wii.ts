import { z } from "zod";

export const WiiSchema = z.object({
  ip: z
    .string({
      required_error: "IP address is required.",
      invalid_type_error: "IP address must be a string.",
    })
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address."),
  mac: z
    .string({
      required_error: "MAC address is required.",
      invalid_type_error: "MAC address must be a string.",
    })
    .regex(/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/i, "Invalid MAC address."),
  nickname: z
    .string({
      invalid_type_error: "Nickname must be a string.",
    })
    .optional(),
});

export type Wii = z.infer<typeof WiiSchema>;
