-- AlterTable
ALTER TABLE `WordClashGame` MODIFY `currentWord` LONGTEXT NOT NULL;
ALTER TABLE `WordClashGame` MODIFY `players` LONGTEXT NOT NULL;
ALTER TABLE `WordClashGame` MODIFY `playerStates` LONGTEXT NOT NULL;
ALTER TABLE `WordClashGame` MODIFY `lastMove` LONGTEXT NULL;
ALTER TABLE `WordClashGame` MODIFY `chatMessages` LONGTEXT NULL;
ALTER TABLE `WordClashGame` MODIFY `revealedLetters` LONGTEXT NULL;

