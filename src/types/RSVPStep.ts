export enum RSVPStep {
  CODE_INPUT = 1,
  ATTENDANCE_DECISION = 2,
  FAMILY_CONFIRMATION = 3,
  EVENT_SELECTION = 4,
  CONFIRMATION = 5,
  ALREADY_CONFIRMED = 6, // side-state: no step indicator, not part of linear flow
}
