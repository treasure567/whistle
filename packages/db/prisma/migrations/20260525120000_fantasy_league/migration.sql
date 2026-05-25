-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GK', 'DEF', 'MID', 'FWD');

-- CreateEnum
CREATE TYPE "LeagueKind" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "nation" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "priceMillions" DECIMAL(6,1) NOT NULL,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_scores" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "player_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fantasy_teams" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formation" TEXT NOT NULL DEFAULT '4-4-2',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fantasy_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fantasy_picks" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "starter" BOOLEAN NOT NULL DEFAULT true,
    "captain" BOOLEAN NOT NULL DEFAULT false,
    "viceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "benchOrder" INTEGER,

    CONSTRAINT "fantasy_picks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "LeagueKind" NOT NULL DEFAULT 'PUBLIC',
    "accessToken" TEXT,
    "ownerAddress" TEXT NOT NULL,
    "maxBudgetMillions" DECIMAL(6,1) NOT NULL DEFAULT 100.0,
    "squadSize" INTEGER NOT NULL DEFAULT 15,
    "startingSize" INTEGER NOT NULL DEFAULT 11,
    "transferDeadlineMinutes" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_entries" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "league_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "matchExternalId" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "stakeUsdt" DECIMAL(38,0) NOT NULL DEFAULT 0,
    "status" "PredictionStatus" NOT NULL DEFAULT 'OPEN',
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_externalId_key" ON "players"("externalId");

-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE INDEX "players_nation_idx" ON "players"("nation");

-- CreateIndex
CREATE UNIQUE INDEX "player_scores_playerId_gameweek_key" ON "player_scores"("playerId", "gameweek");

-- CreateIndex
CREATE INDEX "fantasy_teams_ownerAddress_idx" ON "fantasy_teams"("ownerAddress");

-- CreateIndex
CREATE INDEX "fantasy_picks_teamId_idx" ON "fantasy_picks"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "fantasy_picks_teamId_playerId_key" ON "fantasy_picks"("teamId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "leagues_accessToken_key" ON "leagues"("accessToken");

-- CreateIndex
CREATE INDEX "leagues_kind_idx" ON "leagues"("kind");

-- CreateIndex
CREATE INDEX "league_entries_leagueId_idx" ON "league_entries"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "league_entries_leagueId_teamId_key" ON "league_entries"("leagueId", "teamId");

-- CreateIndex
CREATE INDEX "predictions_ownerAddress_idx" ON "predictions"("ownerAddress");

-- CreateIndex
CREATE INDEX "predictions_matchExternalId_idx" ON "predictions"("matchExternalId");

-- AddForeignKey
ALTER TABLE "player_scores" ADD CONSTRAINT "player_scores_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_picks" ADD CONSTRAINT "fantasy_picks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "fantasy_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_picks" ADD CONSTRAINT "fantasy_picks_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entries" ADD CONSTRAINT "league_entries_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_entries" ADD CONSTRAINT "league_entries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "fantasy_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

