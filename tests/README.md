# Integration Tests

This directory contains integration tests for the skills-introduction-to-github library.

## Purpose

Integration tests verify that the library's public API works correctly from an external consumer's perspective. These tests import the library as a dependency would and test real-world usage patterns.

## Test Organization

### `integration_tests.rs`

This file contains 30 integration tests organized into the following categories:

1. **Basic Functionality Tests** (5 tests)
   - Verify basic library usage patterns
   - Test ID functions and Pubkey creation
   
2. **Advanced Functionality Tests** (10 tests)
   - Test determinism and event authority
   - Verify const evaluation and type semantics
   
3. **Edge Cases and Boundary Conditions** (10 tests)
   - Test with empty/long/special seeds
   - Verify behavior with extreme values
   
4. **Real-World Usage Patterns** (5 tests)
   - Test typical workflows
   - Verify concurrent safety patterns
   - Test error handling

## Running the Tests

```bash
# Run all integration tests
cargo test --test integration_tests

# Run a specific test
cargo test --test integration_tests test_library_basic_usage

# Run with verbose output
cargo test --test integration_tests -- --nocapture

# Run integration tests only (exclude unit tests)
cargo test --test '*'
```

## Key Test Scenarios

- ✅ Library can be imported and used as a dependency
- ✅ All public APIs are accessible
- ✅ Type safety is maintained across module boundaries
- ✅ Constants evaluate correctly at compile time
- ✅ Functions produce deterministic results
- ✅ Edge cases are handled gracefully
- ✅ Invalid inputs are rejected appropriately

## Adding New Integration Tests

When adding new functionality to the library:

1. Add an integration test that uses the new feature
2. Test both success and failure scenarios
3. Verify the feature works with existing functionality
4. Document any important usage patterns

## Test Conventions

- Use descriptive test names prefixed with `test_library_`
- Include comments explaining what is being tested
- Test one concept per test function
- Use assertions that provide clear failure messages
- Keep tests focused and independent