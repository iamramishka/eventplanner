-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "reminderAt" TIMESTAMP(3),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "templateId" TEXT;
