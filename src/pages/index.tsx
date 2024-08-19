import { useState } from "react";
import styles from "../styles/Calculator.module.scss";
import Separator from "../components/Separator";

export default function Calculator(props) {
  const [userPlayers, setUserPlayers] = useState(repeat(5, "Select Rank"));
  const [selectedTier, setSelectedTier] = useState("Rookie");

  const baseRanks = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Master",
    "Grandmaster",
  ];

  //Generate all ranks given "baseRanks"
  //You can change the rank numbers by modifying the "6" in "Array(6)" - It should be one less than the highest number
  const allRanks = [];
  baseRanks.map((baseRank) =>
    allRanks.push(
      ...[...Array(6).keys()]
        .slice(1)
        .reverse()
        .map((number) => `${baseRank} ${number}`)
    )
  );

  //Generate mapping of ranks to internal value
  const ranksMap = new Map();
  allRanks.map((rank, index) => ranksMap.set(rank, index + 1));

  //Helper function to do reverse lookups on maps
  function getByValue(map, searchValue) {
    for (let [key, value] of map.entries()) {
      if (value === searchValue) return key;
    }
  }

  //Generate mapping of tier Tranq SR limits
  const tiersMap = [
    { tier: "Rookie", min: 16, avgMax: 20, max: 21 },
    { tier: "Intermediate", min: 21, avgMax: 24, max: 26 },
    { tier: "Advanced", min: 26, avgMax: 28, max: 30 },
    { tier: "Premier", min: 31, avgMax: 33, max: 35 },
  ];

  //Update an existing player in state
  function selectPlayer(selectedIndex, newPlayer) {
    const nextPlayers = userPlayers.map((userPlayer, index) => {
      if (index === selectedIndex) {
        return newPlayer;
      } else {
        return userPlayer;
      }
    });
    setUserPlayers(nextPlayers);
  }

  //Remove player from state
  function removePlayer(selectedIndex) {
    if (userPlayers.length > 1) {
      const nextPlayers = userPlayers.filter((element, index) => {
        return index !== selectedIndex;
      });
      setUserPlayers(nextPlayers);
    } else {
      alert("Must have at least one player to calculate");
    }
  }

  //Helper method for computing average Tranq SR
  const calculateRank = () => {
    const tierMin = tiersMap.find((tier) => tier.tier === selectedTier).min;
    let calculatedRank = "";
    let srArray = getSrArray();
    srArray.forEach((element, index) => {
      if (element < tierMin) {
        srArray[index] = tierMin;
      }
    });

    srArray = srArray.sort((a, b) => b - a).slice(0, 5);
    calculatedRank = srArray
      .sort((a, b) => b - a)
      .slice(0, 5)
      .reduce((partialSum, a) => partialSum + a, 0);

    var resultString = `${getByValue(
      ranksMap,
      Math.round(calculatedRank / srArray.length)
    )} (${Math.round((calculatedRank / srArray.length) * 100) / 100})`;
    if (resultString.includes("undefined")) return "0";
    return resultString;
  };

  //Determines whether the team qualifies for the selected ranks and
  //explains why not if needed
  const getQualified = () => {
    const calculatedSr = calculateRank().split("(")[1]?.slice(0, -1);
    const tier = tiersMap.find((tier) => tier.tier === selectedTier);
    let qualified = true;
    let messages = [];
    const srArray = getSrArray();

    if (Math.round(calculatedSr) > tier.avgMax) {
      qualified = false;
      messages.push("Team average SR is too high.");
    }
    if (Math.max(...srArray) > tier.max) {
      qualified = false;

      messages.push("One or more players are above the tier's maximum SR.");
    }
    if (srArray.length > 10 || srArray.length < 5) {
      qualified = false;
      messages.push("Team must have between 5 and 10 members");
    }
    return { qualified: qualified, messages: messages };
  };

  //Helper method to repeat placeholder
  function repeat(num, whatTo) {
    var arr = [];
    for (var i = 0; i < num; i++) {
      arr.push(whatTo);
    }
    return arr;
  }

  //Helper method to compute an array of Tranq SRs
  const getSrArray = () => {
    const arrayToCalc = userPlayers.filter((rank) => {
      return rank !== "Select Rank";
    });
    const srArray = arrayToCalc.map((player) => ranksMap.get(player));
    return srArray;
  };

  //Helper method to get tier object for current selected tier
  const getTier = () => {
    return tiersMap.find((tier) => tier.tier === selectedTier);
  };

  return (
    <div className={[styles.calcContainer, "container"].join(" ")}>
      <Separator className={styles.separator}>
        <span>SPCS SR</span> Calculator
      </Separator>

      <div className={[styles.tierSelector, "blockel"].join(" ")}>
        <span className={styles.tierSelectHelp}>Select a tier</span>
        <select
          className={styles.tierSelect}
          onChange={() => setSelectedTier(event.target.value)}
        >
          <option value="Rookie">Rookie</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Premier">Premier</option>
        </select>
        <span className={styles.tierInfo  + " " + styles.infos}>
          {true && (
            <>
              Min individual:{" "}
              <span className={styles.tierInfoItem}>
                <span>{getByValue(ranksMap, getTier().min)}</span>
              </span>
              <br /> Max individual:{" "}
              <span className={styles.tierInfoItem}>
                <span>{getByValue(ranksMap, getTier().max)}</span>
              </span>
              <br /> Max average:{" "}
              <span className={styles.tierInfoItem}>
                <span>{getByValue(ranksMap, getTier().avgMax)}</span>
              </span>
            </>
          )}

          <>
            <br />
            <br />
            <span className={styles.tierInfoItem}>
              Only averages top 5 ranks
            </span>
          </>

          {selectedTier === "Premier" && (
            <>
              <br />
              <br />
              <span className={styles.tierInfoItem}>
                Must not have participated as a player in OWL/OW2 Contenders, OWCS Group Stage, FACEIT Masters, or FACEIT Expert Top 4
              </span>
            </>
          )}
        </span>
      </div>
      <div className={[styles.playerList, "blockel"].join(" ")}>
        {/* create "player" objects */}
        {userPlayers.map((rank, index) => (
          <div key={rank + index} className={[styles.player].join(" ")}>
            <button
              className={styles.removeButton}
              onClick={() => removePlayer(index)}
            >
              X
            </button>
            <select
              key={rank + "Select"}
              id={styles.rankSelect}
              onChange={() => selectPlayer(index, event.target.value)}
              value={rank}
            >
              {/* generate dropdown options */}
              {["Select Rank"].concat(allRanks).map((rankOption) => (
                <option key={rankOption + rank} value={rankOption}>
                  {rankOption}
                </option>
              ))}
            </select>

            <span className={styles.internalRank}>
              SPCS SR:{" "}
              {ranksMap.get(rank)
                ? ranksMap.get(rank) >
                  tiersMap.find((tier) => tier.tier === selectedTier).min
                  ? ranksMap.get(rank)
                  : tiersMap.find((tier) => tier.tier === selectedTier).min
                : 0}
            </span>
          </div>
        ))}
        <button
          className={[styles.addButton].join(" ")}
          onClick={() => setUserPlayers(userPlayers.concat("Select Rank"))}
        >
          Add player
        </button>
      </div>
      <div className={[styles.info, "blockel"].join(" ")}>
        <span className={styles.isQualified}>
          {getQualified().qualified ? "Qualified" : "Not Qualified"}
        </span>
        <span className={styles.qualifiedMessages}>
          {getQualified().messages.map((message) => (
            <li key={message} className={styles.qualifiedMessage}>
              {message}
            </li>
          ))}
        </span>
        <span className={styles.calculatedRank}>
          Average SPCS SR:
          <br />
          <strong>{calculateRank()}</strong>
        </span>
      </div>
    </div>
  );
}
