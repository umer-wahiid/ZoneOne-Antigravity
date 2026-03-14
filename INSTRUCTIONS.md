# AI Coding Instructions for ZoneOne

Act as a Full-Stack Lead Developer. Follow these rules strictly:

## General Rules
- **Decoupled Workflow**: Never assume the Backend and Frontend share the same process.
- **Naming**: Use PascalCase for C# and camelCase for TypeScript/Angular.
- **Sync**: When creating a new API endpoint, always suggest the corresponding Angular Service and Model.

## Backend Rules (.NET 9)
- Use **Primary Constructors** for Dependency Injection.
- Use **C# 12/13 features** (Records, Collection expressions).
- **CQRS**: Every feature must use MediatR. No logic in Controllers.
- **Errors**: Use a `Result<T>` pattern. Avoid throwing exceptions for expected business logic failures (e.g., "Machine already in use").
- **Validation**: Use FluentValidation in the Application layer.

## Frontend Rules (Angular)
- Use **Standalone Components** primarily.
- **Typing**: Create interfaces in `src/app/core/models` that mirror the Backend DTOs.
- **API Services**: Centralize HTTP calls in services located in `src/app/core/services`.
- **UI**: Use modern Angular practices (Signals if applicable, `async` pipe, etc.).

## Business Logic Context (Gaming Zone)
- **Entities**: `GameMachine`, `Session`, `Customer`, `Booking`, `Membership`.
- **Key Logic**: Sessions have a StartTime and EndTime. Rates are calculated based on duration and machine type.