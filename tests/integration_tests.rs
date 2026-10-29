//! Integration tests for skills-introduction-to-github
//! 
//! These tests verify the public API of the library works correctly
//! from an external consumer's perspective.

use skills_introduction_to_github::*;

#[test]
fn test_library_basic_usage() {
    // Basic usage pattern: get the program ID and verify it
    let program_id = id();
    assert!(check_id(&program_id));
}

#[test]
fn test_library_id_functions() {
    // Test all ID-related functions
    let id1 = id();
    let id2 = id_const();
    
    assert_eq!(id1, id2);
    assert!(check_id(&id1));
    assert!(check_id(&id2));
}

#[test]
fn test_library_pubkey_creation() {
    // Test creating and using Pubkey from the library
    let bytes = [123u8; 32];
    let pubkey = Pubkey::new_from_array(bytes);
    
    assert_eq!(pubkey.to_bytes(), bytes);
}

#[test]
fn test_library_pubkey_equality() {
    // Test Pubkey comparison
    let bytes = [99u8; 32];
    let pubkey1 = Pubkey::new_from_array(bytes);
    let pubkey2 = Pubkey::new_from_array(bytes);
    
    assert_eq!(pubkey1, pubkey2);
}

#[test]
fn test_library_derive_program_address() {
    // Test program address derivation
    let seed = b"integration_test";
    let program_id = [0u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_derive_program_address_determinism() {
    // Verify deterministic behavior
    let seed = b"deterministic";
    let program_id = [1u8; 32];
    
    let (addr1, bump1) = derive_program_address(&[seed], &program_id);
    let (addr2, bump2) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(addr1, addr2);
    assert_eq!(bump1, bump2);
}

#[test]
fn test_library_event_authority() {
    // Test the EVENT_AUTHORITY_AND_BUMP constant
    let (authority, bump) = EVENT_AUTHORITY_AND_BUMP;
    
    assert_eq!(authority.to_bytes().len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_event_authority_consistency() {
    // Verify event authority is consistent with manual derivation
    let (authority, bump) = EVENT_AUTHORITY_AND_BUMP;
    let (expected_addr, expected_bump) = 
        derive_program_address(&[b"__event_authority"], &ID_CONST.to_bytes());
    
    assert_eq!(authority.to_bytes(), expected_addr);
    assert_eq!(bump, expected_bump);
}

#[test]
fn test_library_check_id_valid() {
    // Test check_id with valid IDs
    assert!(check_id(&ID));
    assert!(check_id(&ID_CONST));
    assert!(check_id(&id()));
    assert!(check_id(&id_const()));
}

#[test]
fn test_library_check_id_invalid() {
    // Test check_id with invalid IDs
    let invalid_id = Pubkey::new_from_array([1u8; 32]);
    assert!(!check_id(&invalid_id));
    
    let another_invalid = Pubkey::new_from_array([255u8; 32]);
    assert!(!check_id(&another_invalid));
}

#[test]
fn test_library_pubkey_copy_semantics() {
    // Verify Pubkey has Copy semantics
    let pubkey1 = Pubkey::new_from_array([42u8; 32]);
    let pubkey2 = pubkey1; // This is a copy
    
    assert_eq!(pubkey1, pubkey2);
    
    // Both should still be usable
    assert_eq!(pubkey1.to_bytes(), pubkey2.to_bytes());
}

#[test]
fn test_library_pubkey_clone() {
    // Test explicit cloning
    let pubkey1 = Pubkey::new_from_array([77u8; 32]);
    let pubkey2 = pubkey1.clone();
    
    assert_eq!(pubkey1, pubkey2);
}

#[test]
fn test_library_multiple_seeds() {
    // Test deriving with the seed format used in the library
    let seeds: &[&[u8]] = &[b"__event_authority"];
    let program_id = ID_CONST.to_bytes();
    let (address, bump) = derive_program_address(seeds, &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_const_evaluation() {
    // Test that constants can be used in const contexts
    const TEST_ID: Pubkey = ID_CONST;
    const TEST_EVENT: (Pubkey, u8) = EVENT_AUTHORITY_AND_BUMP;
    
    assert_eq!(TEST_ID, ID_CONST);
    assert_eq!(TEST_EVENT.0, EVENT_AUTHORITY_AND_BUMP.0);
    assert_eq!(TEST_EVENT.1, EVENT_AUTHORITY_AND_BUMP.1);
}

#[test]
fn test_library_zero_id() {
    // Verify the ID is initialized to zero array
    let expected = Pubkey::new_from_array([0u8; 32]);
    assert_eq!(id(), expected);
    assert_eq!(ID, expected);
    assert_eq!(ID_CONST, expected);
}

#[test]
fn test_library_pubkey_debug() {
    // Test Debug implementation
    let pubkey = Pubkey::new_from_array([1u8; 32]);
    let debug_str = format!("{:?}", pubkey);
    
    assert!(!debug_str.is_empty());
    assert!(debug_str.contains("Pubkey"));
}

#[test]
fn test_library_different_program_ids() {
    // Test that different program IDs produce different addresses
    let seed = b"test";
    let prog_id1 = [1u8; 32];
    let prog_id2 = [2u8; 32];
    
    let (addr1, _) = derive_program_address(&[seed], &prog_id1);
    let (addr2, _) = derive_program_address(&[seed], &prog_id2);
    
    assert_ne!(addr1, addr2);
}

#[test]
fn test_library_different_seeds() {
    // Test that different seeds produce different addresses
    let seed1 = b"seed_one";
    let seed2 = b"seed_two";
    let program_id = [0u8; 32];
    
    let (addr1, _) = derive_program_address(&[seed1], &program_id);
    let (addr2, _) = derive_program_address(&[seed2], &program_id);
    
    assert_ne!(addr1, addr2);
}

#[test]
fn test_library_empty_seed() {
    // Test with empty seed
    let seed = b"";
    let program_id = [0u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_long_seed() {
    // Test with a very long seed
    let seed = b"this_is_a_very_long_seed_name_that_might_be_used_in_practice";
    let program_id = [0u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_special_characters_in_seed() {
    // Test with special characters
    let seed = b"__special__seed__";
    let program_id = [0u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_null_bytes_in_seed() {
    // Test with null bytes in seed
    let seed = b"\0test\0seed\0";
    let program_id = [0u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_max_values() {
    // Test with maximum values
    let seed = b"max";
    let program_id = [255u8; 32];
    let (address, bump) = derive_program_address(&[seed], &program_id);
    
    assert_eq!(address.len(), 32);
    assert_eq!(bump, 255);
}

#[test]
fn test_library_sequential_calls() {
    // Test that sequential calls produce consistent results
    let seed = b"sequential";
    let program_id = [10u8; 32];
    
    let results: Vec<_> = (0..5)
        .map(|_| derive_program_address(&[seed], &program_id))
        .collect();
    
    // All results should be identical
    for i in 1..results.len() {
        assert_eq!(results[0], results[i]);
    }
}

#[test]
fn test_library_pubkey_size() {
    // Verify Pubkey size matches expectations
    use std::mem::size_of;
    assert_eq!(size_of::<Pubkey>(), 32);
}

#[test]
fn test_library_typical_usage_workflow() {
    // Test a typical workflow using the library
    
    // 1. Get the program ID
    let program_id = id();
    
    // 2. Verify it's correct
    assert!(check_id(&program_id));
    
    // 3. Derive an event authority
    let (event_auth, bump) = EVENT_AUTHORITY_AND_BUMP;
    
    // 4. Use the derived address
    assert_eq!(event_auth.to_bytes().len(), 32);
    assert!(bump <= 255);
    
    // 5. Create custom addresses
    let custom_seed = b"my_custom_seed";
    let (custom_addr, custom_bump) = 
        derive_program_address(&[custom_seed], &program_id.to_bytes());
    
    assert_eq!(custom_addr.len(), 32);
    assert_eq!(custom_bump, 255);
}

#[test]
fn test_library_error_handling_invalid_id() {
    // Test handling of invalid IDs
    let valid_id = id();
    let invalid_id = Pubkey::new_from_array([99u8; 32]);
    
    assert!(check_id(&valid_id));
    assert!(!check_id(&invalid_id));
    
    // Verify the distinction is clear
    assert_ne!(valid_id, invalid_id);
}

#[test]
fn test_library_boundary_conditions() {
    // Test boundary conditions for addresses
    let seeds = [
        &b""[..],
        &b"\0"[..],
        &b"\xFF"[..],
        &b"a"[..],
        &b"zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"[..],
    ];
    
    let program_id = [0u8; 32];
    
    for seed in &seeds {
        let (address, bump) = derive_program_address(&[seed], &program_id);
        assert_eq!(address.len(), 32);
        assert_eq!(bump, 255);
    }
}

#[test]
fn test_library_concurrent_safety_simulation() {
    // Simulate concurrent access patterns
    let program_id = id();
    
    // Multiple "threads" reading the same ID
    let ids: Vec<_> = (0..10).map(|_| id()).collect();
    
    // All should be identical
    for retrieved_id in &ids {
        assert_eq!(*retrieved_id, program_id);
        assert!(check_id(retrieved_id));
    }
}

#[test]
fn test_library_event_authority_seed_format() {
    // Verify the event authority uses the correct seed format
    let manual_derivation = derive_program_address(
        &[b"__event_authority"],
        &ID_CONST.to_bytes()
    );
    
    let (authority, bump) = EVENT_AUTHORITY_AND_BUMP;
    
    assert_eq!(authority.to_bytes(), manual_derivation.0);
    assert_eq!(bump, manual_derivation.1);
}