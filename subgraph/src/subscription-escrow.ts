import { BigInt, Address, BigDecimal, log } from "@graphprotocol/graph-ts"
import {
  ProviderRegistered as ProviderRegisteredEvent,
  PlanCreated as PlanCreatedEvent,
  SubscriptionCreated as SubscriptionCreatedEvent,
  PaymentProcessed as PaymentProcessedEvent,
  ProviderEarnings as ProviderEarningsEvent
} from "../generated/SubscriptionEscrow/SubscriptionEscrow"
import { 
  Provider, 
  Plan, 
  UserSubscription, 
  Payment, 
  ProviderEarning, 
  GlobalStats, 
  DailyMetric 
} from "../generated/schema"

export function handleProviderRegistered(event: ProviderRegisteredEvent): void {
  let id = event.params.provider.toHexString()
  let provider = new Provider(id)
  
  provider.address = event.params.provider
  provider.name = event.params.name
  provider.registeredAt = event.block.timestamp
  provider.totalPlans = BigInt.fromI32(0)
  provider.totalSubscriptions = BigInt.fromI32(0)
  provider.totalRevenue = BigDecimal.fromString("0")
  provider.totalEarnings = BigDecimal.fromString("0")
  provider.lastActivityAt = event.block.timestamp
  provider.isActive = true
  provider.monthlyRevenue = BigDecimal.fromString("0")
  provider.weeklyRevenue = BigDecimal.fromString("0")
  provider.avgRevenuePerSubscription = BigDecimal.fromString("0")
  
  provider.save()
}

export function handlePlanCreated(event: PlanCreatedEvent): void {
  let id = event.params.planId.toString()
  let plan = new Plan(id)
  
  plan.planId = event.params.planId
  plan.provider = event.params.provider.toHexString()
  plan.price = event.params.price.toBigDecimal()
  plan.interval = event.params.interval
  plan.createdAt = event.block.timestamp
  plan.totalSubscriptions = BigInt.fromI32(0)
  plan.activeSubscriptions = BigInt.fromI32(0)
  plan.totalRevenue = BigDecimal.fromString("0")
  plan.subscriptionRate = BigDecimal.fromString("0")
  plan.avgSubscriptionLength = BigInt.fromI32(0)
  plan.churnRate = BigDecimal.fromString("0")
  plan.isPopular = false
  
  plan.save()
}

export function handleSubscriptionCreated(event: SubscriptionCreatedEvent): void {
  let id = event.params.subscriptionId.toString()
  let subscription = new UserSubscription(id)
  
  subscription.subscriptionId = event.params.subscriptionId
  subscription.plan = event.params.planId.toString()
  subscription.subscriber = event.params.user
  subscription.createdAt = event.block.timestamp
  subscription.isActive = true
  subscription.lastPaymentAt = event.block.timestamp
  subscription.nextPaymentDue = event.block.timestamp.plus(BigInt.fromI32(86400))
  subscription.totalPaid = BigDecimal.fromString("0")
  subscription.paymentCount = BigInt.fromI32(0)
  subscription.subscriptionLength = BigInt.fromI32(0)
  subscription.avgPaymentAmount = BigDecimal.fromString("0")
  subscription.status = "ACTIVE"
  
  subscription.save()
}

export function handlePaymentProcessed(event: PaymentProcessedEvent): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let payment = new Payment(id)
  
  payment.subscription = event.params.subscriptionId.toString()
  payment.from = event.params.from
  payment.to = event.params.to
  payment.amount = event.params.amount.toBigDecimal()
  payment.timestamp = event.block.timestamp
  payment.transactionHash = event.transaction.hash
  payment.blockNumber = event.block.number
  payment.isRecurring = false
  payment.paymentIndex = BigInt.fromI32(1)
  payment.protocolFee = BigDecimal.fromString("0")
  payment.providerAmount = event.params.amount.toBigDecimal()
  
  payment.save()
  
  // Update provider analytics
  let provider = Provider.load(event.params.to.toHexString())
  if (provider) {
    provider.totalRevenue = provider.totalRevenue.plus(event.params.amount.toBigDecimal())
    provider.lastActivityAt = event.block.timestamp
    provider.save()
  }
}

export function handleProviderEarnings(event: ProviderEarningsEvent): void {
  let id = event.params.provider.toHexString() + "-" + event.params.planId.toString() + "-" + event.transaction.hash.toHexString()
  let earning = new ProviderEarning(id)
  
  earning.provider = event.params.provider.toHexString()
  earning.plan = event.params.planId.toString()
  earning.amount = event.params.amount.toBigDecimal()
  earning.timestamp = event.block.timestamp
  earning.transactionHash = event.transaction.hash
  earning.blockNumber = event.block.number
  earning.cumulativeEarnings = event.params.amount.toBigDecimal()
  earning.earningType = "RECURRING_PAYMENT"
  
  earning.save()
  
  // Update provider total earnings
  let provider = Provider.load(event.params.provider.toHexString())
  if (provider) {
    provider.totalEarnings = provider.totalEarnings.plus(event.params.amount.toBigDecimal())
    provider.lastActivityAt = event.block.timestamp
    provider.save()
  }
  
  // Update plan analytics
  let plan = Plan.load(event.params.planId.toString())
  if (plan) {
    plan.totalRevenue = plan.totalRevenue.plus(event.params.amount.toBigDecimal())
    plan.save()
  }
}

// TODO: Add escrow event handlers after ABI update
// export function handleEscrowDeposit(event: EscrowDepositEvent): void {
//   let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
//   let deposit = new EscrowDeposit(id)
//   
//   deposit.user = event.params.user
//   deposit.amount = event.params.amount
//   deposit.newBalance = event.params.newBalance
//   deposit.blockNumber = event.block.number
//   deposit.blockTimestamp = event.block.timestamp
//   deposit.transactionHash = event.transaction.hash
//   
//   deposit.save()
// }

// export function handleEscrowWithdrawal(event: EscrowWithdrawalEvent): void {
//   let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
//   let withdrawal = new EscrowWithdrawal(id)
//   
//   withdrawal.user = event.params.user
//   withdrawal.amount = event.params.amount
//   withdrawal.newBalance = event.params.newBalance
//   withdrawal.blockNumber = event.block.number
//   withdrawal.blockTimestamp = event.block.timestamp
//   withdrawal.transactionHash = event.transaction.hash
//   
//   withdrawal.save()
// }
