# ZoneOne Project Architecture

## Overview
ZoneOne is a Gaming Zone Management System built as a decoupled solution:
- **Backend**: .NET 9 Web API following Clean Architecture.
- **Frontend**: Angular (latest) SPA.

## Backend Structure (Clean Architecture)
Location: `/backend`
1. **ZoneOne.Domain**: Enterprise logic. Entities (Machine, Booking, Customer), Value Objects, Domain Events. No dependencies.
2. **ZoneOne.Application**: Application logic. MediatR Commands/Queries, DTOs, Handlers, Interfaces, FluentValidation.
3. **ZoneOne.Infrastructure**: Data access & external services. EF Core (DbContext), Migrations, Identity, Repository implementations.
4. **ZoneOne (API)**: Presentation layer. Controllers, Program.cs, Middleware.

## Frontend Structure
Location: `/frontend/zoneone-admin`
- **Pattern**: Modular or Standalone components.
- **Communication**: Interacts with Backend via REST API.
- **State Management**: Service-based (BehaviorSubjects) or NgRx (if complexity increases).

## Data Flow
Frontend (Angular) -> API (Controller) -> Application (MediatR Handler) -> Domain (Logic) -> Infrastructure (Persistence)