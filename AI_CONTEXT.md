---
description: Rules for Clean Architecture and naming conventions for the ZoneOne Gaming Project
globs: **/*.cs
---

# ZoneOne Project Standards

You are an expert .NET developer specializing in Clean Architecture and DDD. Follow these rules strictly when generating code for the ZoneOne solution.

## 1. Architectural Layers & Dependencies
- **ZoneOne.Domain**: The core. Contains Entities, Value Objects, Enums, and Domain Exceptions. **Zero dependencies** on other projects or external libraries (except MediatR if using Domain Events).
- **ZoneOne.Application**: Contains Use Cases (CQRS: Commands/Queries), Handlers, DTOs, Mapping profiles, and Interfaces (e.g., `IGamingDbContext`). Depends ONLY on Domain.
- **ZoneOne.Infrastructure**: Implementation of interfaces (EF Core, Email, File Storage). Depends on Application and Domain.
- **ZoneOne (API)**: The entry point. Controllers, Middleware, and DI registration. Depends on Application and Infrastructure.

## 2. Naming Conventions
- **Entities**: Use pluralized names for tables but singular for classes (e.g., `GamingSession`, `Booking`).
- **CQRS**: 
  - Commands: `[Action][Entity]Command` (e.g., `CreateBookingCommand`)
  - Queries: `Get[Entity]By[Criteria]Query` (e.g., `GetActiveSessionsQuery`)
- **Handlers**: Must match the command/query name + `Handler` (e.g., `CreateBookingCommandHandler`).
- **DTOs**: Suffix with `Dto` (e.g., `SessionSummaryDto`). Do not expose Entities directly in API responses.
- **Interfaces**: Always prefix with `I` (e.g., `IBookingService`).

## 3. Gaming Zone Business Logic Ideas
- **Entities**: `GameMachine`, `Booking`, `Customer`, `MembershipCard`, `Transaction`, `Session`.
- **Logic**: Implement "Rate Calculation" logic in the Domain layer as a Domain Service or within the Entity.
- **Validation**: Use FluentValidation in the Application layer for request validation.

## 4. Coding Patterns
- Use **Primary Constructors** (C# 12) for dependency injection.
- Use **Records** for DTOs and CQRS Requests (immutable).
- Use **Result Pattern** (e.g., `Result<T>`) for error handling instead of throwing exceptions for business flow.
- Follow **DRY**, **KISS**, and **YAGNI**.