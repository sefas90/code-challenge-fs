import { Router, Request, Response } from "express";
import { eventPayloadSchema } from "@voycelink/contracts";
import type { EventPayload } from "../domain/call";
import { callService } from "../services";
import { apiKeyAuth } from "../middleware/apiKey";

const router = Router();

function isValidationError(error: unknown): error is Error {
  return (
    error instanceof Error ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "ZodError" &&
      "issues" in error)
  );
}

router.post("/", apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const payload: EventPayload = eventPayloadSchema.parse(req.body);
    const event = await callService.processEvent(payload);
    res.status(201).json(event);
  } catch (error) {
    if (isValidationError(error)) {
      res.status(400).json({
        message: "Invalid event payload",
        issues: error.message,
      });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
