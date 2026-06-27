-- Create QuizResponse table
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" TEXT DEFAULT '[]',
    "recommendations" TEXT DEFAULT '[]',
    "severity" TEXT DEFAULT 'low',
    "status" TEXT DEFAULT 'pending',
    "doctorId" TEXT DEFAULT '',
    "doctorName" TEXT DEFAULT '',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "QuizResponse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuizResponse_userId_idx" ON "QuizResponse"("userId");
CREATE INDEX "QuizResponse_status_idx" ON "QuizResponse"("status");

-- Create BookingNote table
CREATE TABLE "BookingNote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "healthNotes" TEXT DEFAULT '',
    "allergies" TEXT DEFAULT '',
    "medications" TEXT DEFAULT '',
    "conditions" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BookingNote_bookingId_key" UNIQUE ("bookingId")
);

-- Create ClinicEnquiry table
CREATE TABLE "ClinicEnquiry" (
    "id" TEXT NOT NULL,
    "clinicName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "formulas" TEXT DEFAULT '[]',
    "qty" INTEGER DEFAULT 0,
    "address" TEXT DEFAULT '',
    "instructions" TEXT DEFAULT '',
    "status" TEXT DEFAULT 'pending',
    "assignedTo" TEXT DEFAULT '',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClinicEnquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClinicEnquiry_status_idx" ON "ClinicEnquiry"("status");

-- Create ConsultationRequest table
CREATE TABLE "ConsultationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT DEFAULT '',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "preferredTime" TEXT DEFAULT '',
    "status" TEXT DEFAULT 'pending',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- Create LabReportFile table
CREATE TABLE "LabReportFile" (
    "id" TEXT NOT NULL,
    "labReportId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabReportFile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LabReportFile_labReportId_key" UNIQUE ("labReportId")
);

-- Add fingerprintDone and faceScanDone to ConsentRecord
ALTER TABLE "ConsentRecord" ADD COLUMN "fingerprintDone" BOOLEAN DEFAULT false;
ALTER TABLE "ConsentRecord" ADD COLUMN "faceScanDone" BOOLEAN DEFAULT false;

-- Add quizResponses relation to User
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add booking relation to BookingNote
ALTER TABLE "BookingNote" ADD CONSTRAINT "BookingNote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add labReport relation to LabReportFile
ALTER TABLE "LabReportFile" ADD CONSTRAINT "LabReportFile_labReportId_fkey" FOREIGN KEY ("labReportId") REFERENCES "LabReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
