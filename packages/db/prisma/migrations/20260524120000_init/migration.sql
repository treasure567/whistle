-- CreateEnum
CREATE TYPE "AgentKind" AS ENUM ('SCOUT', 'BOOKIE', 'MANAGER');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "kind" "AgentKind" NOT NULL,
    "name" TEXT NOT NULL,
    "strategyHash" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "registryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "homeCode" TEXT NOT NULL,
    "awayCode" TEXT NOT NULL,
    "kickoffAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "amount" DECIMAL(38,0) NOT NULL,
    "asset" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "matchId" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "action" JSONB NOT NULL,
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_kind_key" ON "agents"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "matches_externalId_key" ON "matches"("externalId");

-- CreateIndex
CREATE INDEX "matches_kickoffAt_idx" ON "matches"("kickoffAt");

-- CreateIndex
CREATE INDEX "allocations_userAddress_idx" ON "allocations"("userAddress");

-- CreateIndex
CREATE INDEX "allocations_agentId_idx" ON "allocations"("agentId");

-- CreateIndex
CREATE INDEX "decisions_agentId_createdAt_idx" ON "decisions"("agentId", "createdAt");

-- CreateIndex
CREATE INDEX "decisions_txHash_idx" ON "decisions"("txHash");

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

