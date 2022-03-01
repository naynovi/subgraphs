import { BigInt } from '@graphprotocol/graph-ts'
import { log } from 'matchstick-as'
import { Incentive } from '../../generated/schema'

const MAX_UINT112_VALUE = BigInt.fromString('2596148429267413814265248164610047') // 2^112÷2-1

export function getOrCreateIncentive(id: string): Incentive {
  let incentive = Incentive.load(id)

  if (incentive === null) {
    incentive = new Incentive(id)
    incentive.save()
  }

  return incentive as Incentive
}

export function accrueRewards(incentive: Incentive, timestamp: BigInt): void {
  let maxTime = timestamp < incentive.endTime ? timestamp : incentive.endTime

  if (incentive.liquidityStaked > BigInt.fromI32(0) && incentive.lastRewardTime < maxTime) {
    const totalTime = incentive.endTime.minus(incentive.lastRewardTime)
    const passedTime = maxTime.minus(incentive.lastRewardTime)
    const rate = passedTime.div(totalTime)
    const reward = incentive.rewardRemaining.times(rate)
    log.debug('totalTime: {}', [totalTime.toString()])
    log.debug('passedTime: {}', [passedTime.toString()])
    log.debug('rate: {}', [rate.toString()])
    log.debug('reward: {}', [reward.toString()])
    log.debug('liquidityStaked: {}', [incentive.liquidityStaked.toString()])

    const liqudity = reward.times(MAX_UINT112_VALUE).div(incentive.liquidityStaked)
    incentive.rewardPerLiquidity = incentive.rewardPerLiquidity.plus(liqudity)
    incentive.rewardRemaining = incentive.rewardRemaining.minus(reward)
    incentive.lastRewardTime = maxTime
  } else if (incentive.liquidityStaked == BigInt.fromI32(0 as i8)) {
    incentive.lastRewardTime = maxTime
  }
  incentive.save()
}
