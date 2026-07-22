import { useState, useCallback } from 'react';

const TRACK_DATA = {
  length: 150,
  jumps: {
    25: 10,
    85: 10,
    100: 15,
    115: 10,
  },
  turns: [
    { start: 50, end: 75 },
    { start: 125, end: 150 },
  ],
};

const ANNOUNCER_LINES = {
  start: [
    "The mounts are at the starting line and they are eager to run!",
    "They're at the post... and they're off! We are underway!",
    "The flag drops! Let's see who handles the dirt best today!",
  ],
  initiative_win: [
    "A blinding reaction time from {name}! They take the early lead!",
    "{name} wins the hole-shot! Fantastic break off the line!",
    "Incredible jump! {name} asserts dominance immediately!",
  ],
  initiative_loss: [
    "{name} was caught sleeping at the gate! They trail early.",
    "A sluggish start for {name}. They have ground to make up.",
  ],
  hard_brake: [
    "SKID OUT! {name} carried way too much speed into the turn and had to slam the brakes!",
    "A massive miscalculation! {name} locks up and wastes critical momentum!",
  ],
  speed_high: [
    "{name} is absolutely flying down this straight!",
    "Look at that top speed! {name} and their mount are perfectly synced!",
  ],
  speed_low: [
    "{name} is struggling to find their rhythm here.",
    "The mount seems a bit sluggish on this stretch. Not ideal.",
  ],
  turn_high: [
    "{name} hits the apex perfectly! What a corner!",
    "Masterful handling through the turn by {name}!",
  ],
  turn_low: [
    "{name} takes it way too wide! They are bleeding time!",
    "Slipping on the dirt! {name} loses all their momentum in the corner.",
  ],
  jump_success: [
    "Incredible air! {name} clears the obstacle flawlessly!",
    "Perfect takeoff, perfect landing for {name}!",
  ],
  jump_crash: [
    "BRUTAL CRASH! {name} clips the hazard and goes down hard!",
    "Disaster! {name} misjudged the leap and wipes out!",
  ],
  recovery: [
    "{name} is back in the saddle, but their speed is crippled right now!",
    "Shaking off the dust, {name} manages a painfully slow recovery.",
  ],
  finish: [
    "AND CROSSING THE FINISH LINE... IT'S {name}! WHAT A HEAT!",
    "INCREDIBLE! {name} takes the victory!",
  ]
};

const getBark = (category, name) => {
  const lines = ANNOUNCER_LINES[category] || ANNOUNCER_LINES['start'];
  return lines[Math.floor(Math.random() * lines.length)].replace(/\{name\}/g, name);
};

const rollDice = (max) => Math.floor(Math.random() * max) + 1;

export function useRaceEngine(initialRacers) {
  const [gameSpeed, setGameSpeed] = useState(1);
  const [activeRacerIndex, setActiveRacerIndex] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const laps = initialRacers[0]?.laps || 1;
  const MAX_DISTANCE = TRACK_DATA.length * laps;

  const [racers, setRacers] = useState(
    initialRacers.map((r, i) => ({
      ...r,
      engineId: `racer_${i}`,
      position: 0,
      turnCount: 0,
      headstrongUsed: false,
      cornerDemonUsed: false,
      jumperUsed: false,
      hasAdvantage: false,
      isPenalized: false,
      isResilient: false,
      transitionDuration: 0,
      passives: r.passives || []
    }))
  );

  const addLog = useCallback((msg) => setLogs((prev) => [...prev, msg]), []);
  const sleep = useCallback((ms) => new Promise(resolve => setTimeout(resolve, ms / gameSpeed)), [gameSpeed]);

  // Generic Advantage Roll Helper
  const evaluateRoll = (stat, hasAdvantage, isResilient) => {
    const bonus = isResilient ? 1 : 0;
    const r1 = rollDice(stat) + bonus;
    if (hasAdvantage) {
       const r2 = rollDice(stat) + bonus;
       return { value: Math.max(r1, r2), rolls: [r1, r2] };
    }
    return { value: r1, rolls: [r1] };
  };

  const executeInitiative = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const r1Jump = racers[0].racingStats.jump;
    const r2Jump = racers[1].racingStats.jump;

    addLog(getBark('start', ''));
    await sleep(1500);

    if (r1Jump !== r2Jump) {
      const winnerIdx = r1Jump > r2Jump ? 0 : 1;
      const loserIdx = winnerIdx === 0 ? 1 : 0;
      
      addLog(`${racers[winnerIdx].name} uses their superior Jump advantage to take the lead!`);
      await sleep(1500);
      
      setActiveRacerIndex(winnerIdx);
      setBusy(false);
      return;
    }

    let r1Roll = 0;
    let r2Roll = 0;

    addLog("It's a dead heat at the line! Proceeding to a Jump Roll-Off!");
    
    setFlash({
      type: 'initiative',
      rolls: [0, 0],
      maxRolls: [r1Jump, r2Jump],
      winnerIndex: null,
      isTie: true
    });
    await sleep(2000);

    do {
      r1Roll = rollDice(r1Jump);
      r2Roll = rollDice(r2Jump);

      setFlash({ 
        type: 'initiative', 
        rolls: [r1Roll, r2Roll], 
        maxRolls: [r1Jump, r2Jump], 
        winnerIndex: r1Roll > r2Roll ? 0 : r2Roll > r1Roll ? 1 : null,
        isTie: r1Roll === r2Roll
      });
      await sleep(2000);
      
      if (r1Roll === r2Roll) {
        addLog("Still tied! Rolling again!");
        await sleep(1500);
      }
    } while (r1Roll === r2Roll);
    
    const winnerIdx = r1Roll > r2Roll ? 0 : 1;
    const loserIdx = winnerIdx === 0 ? 1 : 0;
    
    addLog(getBark('initiative_win', racers[winnerIdx].name));
    await sleep(1800);
    addLog(getBark('initiative_loss', racers[loserIdx].name));
    await sleep(1500);

    setFlash(null);
    setActiveRacerIndex(winnerIdx);
    setBusy(false);
  }, [racers, busy, addLog, sleep]);

  const takeTurn = useCallback(async () => {
    if (isFinished || busy) return;
    setBusy(true);

    const currentRacers = racers.map(r => ({ ...r, racingStats: { ...r.racingStats } }));
    const rIndex = activeRacerIndex;
    const racer = currentRacers[rIndex];
    const otherRacer = currentRacers[rIndex === 0 ? 1 : 0];
    const stats = racer.racingStats;
    let pos = racer.position;

    let localPosStart = pos % TRACK_DATA.length;
    if (localPosStart === 0 && pos > 0) localPosStart = TRACK_DATA.length;

    const isInTurn = TRACK_DATA.turns.some((t) => localPosStart >= t.start && localPosStart < t.end);
    const activeStat = isInTurn ? stats.turning : stats.speed;
    const statName = isInTurn ? 'Turn' : 'Speed';

    // Per-Turn Resilient Logic Evaluation
    let isResilient = false;
    if (racer.passives.includes('resilient') && racer.position <= otherRacer.position - 3) {
       isResilient = true;
       if (!racer.isResilient) {
           addLog(`RESILIENT! ${racer.name} is trailing and gains a surge of fighting spirit!`);
       }
    } else if (racer.isResilient) {
       addLog(`${racer.name} has closed the gap. Their resilient surge fades!`);
    }
    racer.isResilient = isResilient;

    let advantageThisRoll = racer.hasAdvantage;
    
    if (racer.passives.includes('corner_demon') && isInTurn && !racer.cornerDemonUsed) {
      advantageThisRoll = true;
      racer.cornerDemonUsed = true;
      addLog(`${racer.name}'s Corner Demon activates! Advantage going into the turn!`);
    }

    if (advantageThisRoll && racer.hasAdvantage) {
      racer.hasAdvantage = false;
    }

    let { value: movement, rolls: movementRolls } = evaluateRoll(activeStat, advantageThisRoll, isResilient);

    let penaltyApplied = false;
    let barkCat = '';
    
    if (racer.isPenalized) {
      movement = Math.max(1, Math.floor(movement / 2));
      racer.isPenalized = false;
      penaltyApplied = true;
      barkCat = 'recovery';
    } else {
      const isHigh = movement >= (activeStat * 0.5);
      barkCat = isInTurn ? (isHigh ? 'turn_high' : 'turn_low') : (isHigh ? 'speed_high' : 'speed_low');
    }

    if (movement === 1 && racer.passives.includes('super_charged')) {
       racer.hasAdvantage = true;
       addLog(`SUPER CHARGED! ${racer.name} ${penaltyApplied ? 'struggled recovering from a wipeout' : 'rolled a 1'} and becomes supercharged!`);
    }
    
    addLog(getBark(barkCat, racer.name));
    
    setFlash({ 
      racerIndex: rIndex, 
      type: 'roll', 
      value: movement, 
      rolls: movementRolls, 
      stat: statName, 
      penaltyApplied, 
      maxVal: activeStat + (isResilient ? 1 : 0)
    });
    
    await sleep(1200);
    setFlash(null);

    let movementRemaining = movement;
    let stoppedEarlyReason = null; 

    const baseStepDuration = 60 / gameSpeed;
    const speedMultiplier = movement < 5 ? (5 - movement) * 0.5 + 1 : 1; 
    const stepDuration = baseStepDuration * speedMultiplier;

    while (movementRemaining > 0 && pos < MAX_DISTANCE) {
      let chunk = 0;
      let reason = null;

      let localPos = pos % TRACK_DATA.length;
      if (localPos === 0 && pos > 0) localPos = TRACK_DATA.length;
      let currentlyInTurn = TRACK_DATA.turns.some(t => localPos >= t.start && localPos < t.end);

      for (let i = 1; i <= movementRemaining; i++) {
        let nextPos = pos + i;
        let localNextPos = nextPos % TRACK_DATA.length;
        if (localNextPos === 0 && nextPos > 0) localNextPos = TRACK_DATA.length;

        if (TRACK_DATA.turns.some(t => t.start === localNextPos) && !currentlyInTurn) {
          chunk = i;
          reason = 'turn_boundary';
          break;
        }
        if (TRACK_DATA.jumps[localNextPos]) {
          chunk = i;
          reason = 'jump';
          break;
        }
        if (nextPos >= MAX_DISTANCE) {
          chunk = i;
          reason = 'finish';
          break;
        }
        chunk = i; 
      }

      racer.transitionDuration = stepDuration;

      for(let step = 0; step < chunk; step++) {
         pos += 1;
         racer.position = pos;
         setRacers([...currentRacers]);
         await sleep(stepDuration);
      }
      
      movementRemaining -= chunk;

      if (reason === 'turn_boundary') {
        stoppedEarlyReason = 'turn_boundary';
        break;
      } else if (reason === 'jump') {
        const localPosForJump = pos % TRACK_DATA.length || (pos > 0 ? TRACK_DATA.length : 0);
        const jumpDiff = TRACK_DATA.jumps[localPosForJump];
        await sleep(300);

        let jumpAdvantage = racer.hasAdvantage;

        if (racer.passives.includes('jumper') && !racer.jumperUsed) {
          jumpAdvantage = true;
          racer.jumperUsed = true;
          addLog(`${racer.name}'s Jumper passive activates! Advantage on the jump!`);
        }

        if (jumpAdvantage && racer.hasAdvantage) {
          racer.hasAdvantage = false;
        }

        const { value: jumpRoll, rolls: jumpRolls } = evaluateRoll(stats.jump, jumpAdvantage, isResilient);

        setFlash({ 
          racerIndex: rIndex, 
          type: 'roll', 
          value: jumpRoll, 
          rolls: jumpRolls, 
          stat: 'Jump', 
          maxVal: stats.jump + (isResilient ? 1 : 0)
        });
        
        await sleep(1000);

        if (jumpRoll === 1 && racer.passives.includes('super_charged')) {
           racer.hasAdvantage = true;
           addLog(`SUPER CHARGED! ${racer.name} stumbled on the jump and becomes supercharged!`);
        }

        if (jumpRoll >= jumpDiff) {
          addLog(getBark('jump_success', racer.name));
          setFlash({ racerIndex: rIndex, type: 'jump_success', value: jumpRoll });
          await sleep(900);
          setFlash(null);
        } else {
          if (racer.passives.includes('headstrong') && !racer.headstrongUsed) {
             addLog(`HEADSTRONG! ${racer.name} powers through the hazard without breaking stride!`);
             racer.headstrongUsed = true;
             racer.isPenalized = false; 
             setFlash({ racerIndex: rIndex, type: 'crash', value: jumpRoll });
             await sleep(1300);
             setFlash(null);
             stoppedEarlyReason = 'crash';
             break;
          } else {
             addLog(getBark('jump_crash', racer.name));
             racer.isPenalized = true;
             setFlash({ racerIndex: rIndex, type: 'crash', value: jumpRoll });
             await sleep(1300);
             setFlash(null);
             stoppedEarlyReason = 'crash';
             break; 
          }
        }
      }
    }

    if (stoppedEarlyReason === 'turn_boundary' && movementRemaining >= 5) {
       addLog(getBark('hard_brake', racer.name));
       setFlash({ racerIndex: rIndex, type: 'hard_brake', value: movementRemaining });
       await sleep(1500);
       setFlash(null);
    }

    racer.turnCount = (racer.turnCount || 0) + 1;

    if (pos >= MAX_DISTANCE) {
      addLog(getBark('finish', racer.name));
      setIsFinished(true);
      setWinner(racer);
    }

    if (!isFinished && pos < MAX_DISTANCE) {
      if (activeRacerIndex === 1) {
        setCurrentTurn(t => t + 1);
      }
      setActiveRacerIndex((prev) => (prev === 0 ? 1 : 0));
    }

    setBusy(false);
  }, [activeRacerIndex, isFinished, busy, racers, addLog, sleep, gameSpeed, MAX_DISTANCE]);

  return { racers, activeRacerIndex, logs, isFinished, winner, takeTurn, executeInitiative, busy, flash, trackData: TRACK_DATA, gameSpeed, setGameSpeed, laps, currentTurn };
}