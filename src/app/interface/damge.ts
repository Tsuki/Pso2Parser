export interface Damge {
  timestamp: Date,
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