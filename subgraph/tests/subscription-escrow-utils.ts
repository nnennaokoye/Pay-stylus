import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  ProviderRegistered,
  PlanCreated,
  SubscriptionCreated,
  PaymentProcessed,
  ProviderEarnings
} from "../generated/SubscriptionEscrow/SubscriptionEscrow"

export function createProviderRegisteredEvent(
  provider: Address,
  name: string
): ProviderRegistered {
  let providerRegisteredEvent = changetype<ProviderRegistered>(newMockEvent())

  providerRegisteredEvent.parameters = new Array()

  providerRegisteredEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  providerRegisteredEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return providerRegisteredEvent
}

export function createPlanCreatedEvent(
  planId: BigInt,
  provider: Address,
  price: BigInt,
  interval: BigInt
): PlanCreated {
  let planCreatedEvent = changetype<PlanCreated>(newMockEvent())

  planCreatedEvent.parameters = new Array()

  planCreatedEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromUnsignedBigInt(planId))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  planCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "interval",
      ethereum.Value.fromUnsignedBigInt(interval)
    )
  )

  return planCreatedEvent
}

export function createSubscriptionCreatedEvent(
  subscriptionId: BigInt,
  user: Address,
  planId: BigInt
): SubscriptionCreated {
  let subscriptionCreatedEvent = changetype<SubscriptionCreated>(newMockEvent())

  subscriptionCreatedEvent.parameters = new Array()

  subscriptionCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "subscriptionId",
      ethereum.Value.fromUnsignedBigInt(subscriptionId)
    )
  )
  subscriptionCreatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  subscriptionCreatedEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromUnsignedBigInt(planId))
  )

  return subscriptionCreatedEvent
}

export function createPaymentProcessedEvent(
  from: Address,
  to: Address,
  amount: BigInt,
  subscriptionId: BigInt
): PaymentProcessed {
  let paymentProcessedEvent = changetype<PaymentProcessed>(newMockEvent())

  paymentProcessedEvent.parameters = new Array()

  paymentProcessedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  paymentProcessedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  paymentProcessedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  paymentProcessedEvent.parameters.push(
    new ethereum.EventParam(
      "subscriptionId",
      ethereum.Value.fromUnsignedBigInt(subscriptionId)
    )
  )

  return paymentProcessedEvent
}

export function createProviderEarningsEvent(
  provider: Address,
  planId: BigInt,
  amount: BigInt
): ProviderEarnings {
  let providerEarningsEvent = changetype<ProviderEarnings>(newMockEvent())

  providerEarningsEvent.parameters = new Array()

  providerEarningsEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  providerEarningsEvent.parameters.push(
    new ethereum.EventParam("planId", ethereum.Value.fromUnsignedBigInt(planId))
  )
  providerEarningsEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return providerEarningsEvent
}
