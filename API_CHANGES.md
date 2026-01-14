# API Changes Based on Class Diagram

## Summary

The GraphQL API has been updated to exactly match the class diagram provided. Here are the key changes:

## Model Changes

### User
**Before**: username, email, password
**After**: firstName, lastName, email, password

### Tournament  
**Before**: name, description, startDate, endDate, status, createdBy
**After**: name, startDate, status, participants[]

### Match
**Before**: tournament ref, round (String), player1, player2, score1, score2, winner, status, matchDate
**After**: bracket ref, round (int), player1, player2, winner

### Bracket (NEW)
**Added**: tournament ref (1-to-1), matches[] (1-to-many)

## API Changes

### Authentication
- `register`: Now requires firstName and lastName instead of username
- `login`: Unchanged (email + password)

### Tournament Mutations
- `createTournament(name, startDate)`: Simplified parameters
- `addParticipant(tournamentId, userId)`: NEW - implements diagram method
- `startTournament(tournamentId)`: NEW - implements diagram method
- `finishTournament(tournamentId)`: NEW - implements diagram method
- Removed: `updateTournament`, `deleteTournament`

### Bracket Operations
- `generateBracket(tournamentId)`: NEW - creates bracket with first round matches
- `getMatchesForRound(bracketId, round)`: NEW - query for round-specific matches

### Match Mutations
- `playMatch(matchId, winnerId)`: NEW - implements diagram method, automatically creates next round
- Removed: `createMatch`, `updateMatch`, `deleteMatch`

## Bracket Generation Logic

The `generateBracket` mutation:
1. Validates tournament has power-of-2 participants (2, 4, 8, 16, etc.)
2. Creates Bracket entity
3. Generates first round matches by pairing participants
4. Stores all match references in bracket

## Automatic Tournament Progression

When `playMatch` is called:
1. Sets winner for the match
2. Checks if all matches in current round are complete
3. If complete and not final, automatically creates next round matches
4. Winners advance to face each other in next round

## Relationships

```
User ← participates in → Tournament
Tournament ← 1:1 → Bracket
Bracket ← 1:many → Match
Match → player1, player2, winner (all reference User)
```
