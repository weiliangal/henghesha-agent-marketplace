"""Enumerations shared across pipeline stages."""

from __future__ import annotations

from enum import StrEnum


class ShotStatus(StrEnum):
    NEW = "NEW"
    INGESTED = "INGESTED"
    TRANSCRIBED = "TRANSCRIBED"
    LOCALIZED = "LOCALIZED"
    CLASSIFIED = "CLASSIFIED"
    QUEUED_RUNWAY = "QUEUED_RUNWAY"
    GENERATING = "GENERATING"
    GENERATED = "GENERATED"
    QC_REVIEW = "QC_REVIEW"
    QC_PASS = "QC_PASS"
    QC_FAIL = "QC_FAIL"
    REWORK = "REWORK"
    LOCKED = "LOCKED"
    CONFORMED = "CONFORMED"
    EXPORTED = "EXPORTED"


class ShotClass(StrEnum):
    UNCLASSIFIED = "UNCLASSIFIED"
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"
    D1 = "D1"
    D2 = "D2"


class RunwayPath(StrEnum):
    PENDING_CLASSIFICATION = "PENDING_CLASSIFICATION"
    ACT_TWO = "ACT_TWO"
    MULTI_ROLE_SPLIT = "MULTI_ROLE_SPLIT"
    GEN4_5 = "GEN4_5"
    GEN4 = "GEN4"
    LIP_SYNC = "LIP_SYNC"
    MANUAL_REVIEW = "MANUAL_REVIEW"


class MotionIntensity(StrEnum):
    UNKNOWN = "UNKNOWN"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


class CameraType(StrEnum):
    UNKNOWN = "UNKNOWN"
    ECU = "ECU"
    CU = "CU"
    MCU = "MCU"
    MEDIUM = "MEDIUM"
    WIDE = "WIDE"
    OTS = "OTS"
    INSERT = "INSERT"
    ESTABLISHING = "ESTABLISHING"
    MOVING = "MOVING"


class EmotionalBeat(StrEnum):
    UNKNOWN = "UNKNOWN"
    NEUTRAL = "NEUTRAL"
    TENSION = "TENSION"
    ANGER = "ANGER"
    SHOCK = "SHOCK"
    HUMILIATION = "HUMILIATION"
    REVENGE = "REVENGE"
    MISUNDERSTANDING = "MISUNDERSTANDING"
    SADNESS = "SADNESS"
    ROMANCE = "ROMANCE"
    TRIUMPH = "TRIUMPH"


class DetectorMode(StrEnum):
    FFMPEG_SCENE = "FFMPEG_SCENE"
    FIXED_WINDOW = "FIXED_WINDOW"


class LogLevel(StrEnum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
