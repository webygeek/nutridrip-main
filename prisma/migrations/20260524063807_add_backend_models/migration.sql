-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "signatureName" TEXT NOT NULL DEFAULT '',
    "fingerprintHash" TEXT NOT NULL DEFAULT '',
    "faceScanHash" TEXT NOT NULL DEFAULT '',
    "ipAddress" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT NOT NULL DEFAULT '',
    "nurseId" TEXT NOT NULL DEFAULT '',
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsentRecord_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "etaMinutes" INTEGER NOT NULL DEFAULT 0,
    "updatedById" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hygieneRating" INTEGER NOT NULL DEFAULT 0,
    "behaviourRating" INTEGER NOT NULL DEFAULT 0,
    "comfortRating" INTEGER NOT NULL DEFAULT 0,
    "overallRating" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT NOT NULL DEFAULT '',
    "isDuringDrip" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CancellationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "originalDate" DATETIME NOT NULL,
    "newDate" DATETIME,
    "feeAmount" INTEGER NOT NULL DEFAULT 0,
    "isSameDay" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CancellationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "link" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dripName" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Recommended',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customNotes" TEXT NOT NULL DEFAULT '',
    "doctorId" TEXT NOT NULL DEFAULT '',
    "doctorName" TEXT NOT NULL DEFAULT '',
    "nurseId" TEXT NOT NULL DEFAULT '',
    "nurseName" TEXT NOT NULL DEFAULT '',
    "nursePhone" TEXT NOT NULL DEFAULT '',
    "protocol" TEXT NOT NULL DEFAULT '[]',
    "score" INTEGER NOT NULL DEFAULT 0,
    "bookingId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Approval" ("createdAt", "customNotes", "doctorId", "doctorName", "dripName", "id", "protocol", "score", "severity", "status", "updatedAt", "userId") SELECT "createdAt", "customNotes", "doctorId", "doctorName", "dripName", "id", "protocol", "score", "severity", "status", "updatedAt", "userId" FROM "Approval";
DROP TABLE "Approval";
ALTER TABLE "new_Approval" RENAME TO "Approval";
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dripId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "sessionStatus" TEXT NOT NULL DEFAULT 'scheduled',
    "location" TEXT NOT NULL DEFAULT 'home',
    "address" TEXT NOT NULL DEFAULT '',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "nurseId" TEXT NOT NULL DEFAULT '',
    "nurseName" TEXT NOT NULL DEFAULT '',
    "nursePhone" TEXT NOT NULL DEFAULT '',
    "doctorId" TEXT NOT NULL DEFAULT '',
    "doctorName" TEXT NOT NULL DEFAULT '',
    "doctorNotes" TEXT NOT NULL DEFAULT '',
    "protocol" TEXT NOT NULL DEFAULT '[]',
    "etaMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "assignedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancellationFee" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_dripId_fkey" FOREIGN KEY ("dripId") REFERENCES "Drip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("address", "amount", "createdAt", "dripId", "id", "location", "notes", "nurseId", "nurseName", "scheduledAt", "status", "updatedAt", "userId") SELECT "address", "amount", "createdAt", "dripId", "id", "location", "notes", "nurseId", "nurseName", "scheduledAt", "status", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Drip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL DEFAULT 0,
    "duration" TEXT NOT NULL DEFAULT '',
    "volume" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "accentGradient" TEXT NOT NULL DEFAULT '',
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "benefits" TEXT NOT NULL DEFAULT '[]',
    "vitaminInfo" TEXT NOT NULL DEFAULT '{}',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Drip" ("accentGradient", "active", "category", "createdAt", "description", "duration", "icon", "id", "ingredients", "name", "popular", "price", "slug", "subtitle", "tags", "updatedAt", "volume") SELECT "accentGradient", "active", "category", "createdAt", "description", "duration", "icon", "id", "ingredients", "name", "popular", "price", "slug", "subtitle", "tags", "updatedAt", "volume" FROM "Drip";
DROP TABLE "Drip";
ALTER TABLE "new_Drip" RENAME TO "Drip";
CREATE UNIQUE INDEX "Drip_slug_key" ON "Drip"("slug");
CREATE TABLE "new_InfusionOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL DEFAULT '',
    "patientId" TEXT NOT NULL DEFAULT '',
    "patientName" TEXT NOT NULL,
    "patientAge" INTEGER NOT NULL DEFAULT 0,
    "patientGender" TEXT NOT NULL DEFAULT '',
    "patientPhone" TEXT NOT NULL DEFAULT '',
    "patientAllergies" TEXT NOT NULL DEFAULT '',
    "patientConditions" TEXT NOT NULL DEFAULT '',
    "dripName" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'clinic',
    "address" TEXT NOT NULL DEFAULT '',
    "nurseId" TEXT NOT NULL DEFAULT '',
    "nurseName" TEXT NOT NULL DEFAULT '',
    "doctorName" TEXT NOT NULL DEFAULT '',
    "doctorPhone" TEXT NOT NULL DEFAULT '',
    "doctorNotes" TEXT NOT NULL DEFAULT '',
    "protocol" TEXT NOT NULL DEFAULT '[]',
    "mixingProtocol" TEXT NOT NULL DEFAULT '[]',
    "infusionRate" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sessionStatus" TEXT NOT NULL DEFAULT 'scheduled',
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "consentSignedAt" DATETIME,
    "fingerprintDone" BOOLEAN NOT NULL DEFAULT false,
    "historyTaken" BOOLEAN NOT NULL DEFAULT false,
    "baselineVitals" TEXT NOT NULL DEFAULT '{}',
    "checklistDone" TEXT NOT NULL DEFAULT '[]',
    "sessionNotes" TEXT NOT NULL DEFAULT '',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InfusionOrder" ("address", "bookingId", "checklistDone", "completedAt", "consentSigned", "createdAt", "doctorName", "doctorNotes", "doctorPhone", "dripName", "historyTaken", "id", "infusionRate", "location", "mixingProtocol", "nurseId", "nurseName", "patientAge", "patientAllergies", "patientConditions", "patientGender", "patientName", "patientPhone", "protocol", "scheduledAt", "sessionNotes", "startedAt", "status", "totalVolume", "updatedAt") SELECT "address", "bookingId", "checklistDone", "completedAt", "consentSigned", "createdAt", "doctorName", "doctorNotes", "doctorPhone", "dripName", "historyTaken", "id", "infusionRate", "location", "mixingProtocol", "nurseId", "nurseName", "patientAge", "patientAllergies", "patientConditions", "patientGender", "patientName", "patientPhone", "protocol", "scheduledAt", "sessionNotes", "startedAt", "status", "totalVolume", "updatedAt" FROM "InfusionOrder";
DROP TABLE "InfusionOrder";
ALTER TABLE "new_InfusionOrder" RENAME TO "InfusionOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRecord_bookingId_key" ON "ConsentRecord"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionFeedback_bookingId_key" ON "SessionFeedback"("bookingId");
