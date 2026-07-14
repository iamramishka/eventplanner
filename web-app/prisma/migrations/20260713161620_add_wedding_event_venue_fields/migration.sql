-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN     "eventTime" TEXT,
ADD COLUMN     "rsvpDeadline" TIMESTAMP(3),
ADD COLUMN     "specialNoteText" TEXT,
ADD COLUMN     "venueAddress" TEXT,
ADD COLUMN     "venueMapLink" TEXT;
