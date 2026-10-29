//! Skills Introduction to GitHub - Anchor ID Reference
//!
//! This module demonstrates the implementation of program ID handling
//! with event authority functionality as referenced from the Solana Anchor repository.

pub mod id;

pub use id::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_exports_id() {
        // Verify that the id module is properly exported
        let program_id = id();
        assert_eq!(program_id, ID);
    }

    #[test]
    fn test_module_exports_check_id() {
        // Verify check_id function is accessible
        assert!(check_id(&id()));
    }

    #[test]
    fn test_module_exports_pubkey() {
        // Verify Pubkey type is accessible
        let bytes = [42u8; 32];
        let pubkey = Pubkey::new_from_array(bytes);
        assert_eq!(pubkey.to_bytes(), bytes);
    }

    #[test]
    fn test_module_exports_derive_program_address() {
        // Verify derive_program_address is accessible
        let seed = b"test";
        let program_id = [0u8; 32];
        let (address, bump) = derive_program_address(&[seed], &program_id);
        assert_eq!(address.len(), 32);
        assert_eq!(bump, 255);
    }

    #[test]
    fn test_module_exports_event_authority() {
        // Verify EVENT_AUTHORITY_AND_BUMP constant is accessible
        let (authority, bump) = EVENT_AUTHORITY_AND_BUMP;
        assert_eq!(authority.to_bytes().len(), 32);
        assert_eq!(bump, 255);
    }

    #[test]
    fn test_module_exports_id_const() {
        // Verify id_const function is accessible
        let program_id = id_const();
        assert_eq!(program_id, ID_CONST);
    }

    #[test]
    fn test_public_api_consistency() {
        // Test that the public API behaves consistently
        let id1 = id();
        let id2 = id();
        assert_eq!(id1, id2);
        assert!(check_id(&id1));
        assert!(check_id(&id2));
    }

    #[test]
    fn test_const_and_static_consistency() {
        // Verify const and static IDs are the same
        assert_eq!(ID, ID_CONST);
        assert_eq!(id(), id_const());
    }

    #[test]
    fn test_module_reexports() {
        // Test that re-exported items work correctly
        use crate::*;
        let test_id = id();
        assert!(check_id(&test_id));
    }

    #[test]
    fn test_documentation_example_pattern() {
        // Test a typical usage pattern that might appear in documentation
        let program_id = id();
        
        // Check if this is the correct program
        if check_id(&program_id) {
            // Use the event authority
            let (event_authority, _bump) = EVENT_AUTHORITY_AND_BUMP;
            assert_eq!(event_authority.to_bytes().len(), 32);
        } else {
            panic!("Invalid program ID");
        }
    }
}
