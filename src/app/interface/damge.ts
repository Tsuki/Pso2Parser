export interface Damage {
  timestamp: number,
  instanceID: number,
  sourceID: number,
  sourceName: string,
  targetID: number,
  targetName: string,
  attackID: number ,
  damage: number,
  IsJA: boolean,
  IsCrit: boolean,
  IsMultiHit: boolean,
  IsMisc: boolean,
  IsMisc2: boolean
}

export interface DisplayData {
  sourceName: string,
  dps: number,
  damage: number,
  lastTimestamp: number
  detail: [Damage],
}

