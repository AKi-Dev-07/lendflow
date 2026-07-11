// Auto-generated TypeScript types matching the Supabase schema.
// These types give you full IntelliSense when querying the database.

export type Database = {
  public: {
    Tables: {
      borrowers: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          phone: string;
          national_id: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          phone: string;
          national_id: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          full_name?: string;
          phone?: string;
          national_id?: string;
          address?: string | null;
          created_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          borrower_id: string;
          principal_amount: number;
          interest_rate: number;
          interest_type: "PERCENTAGE" | "FIXED";
          interest_amount: number;
          emi_type: "NONE" | "WEEKLY" | "MONTHLY";
          emi_amount: number;
          total_due: number;
          amount_paid: number;
          balance: number;
          status: "ACTIVE" | "PAID" | "DEFAULTED";
          issue_date: string;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          borrower_id: string;
          principal_amount: number;
          interest_rate?: number;
          interest_type?: "PERCENTAGE" | "FIXED";
          interest_amount?: number;
          emi_type?: "NONE" | "WEEKLY" | "MONTHLY";
          emi_amount?: number;
          total_due: number;
          amount_paid?: number;
          balance: number;
          status?: "ACTIVE" | "PAID" | "DEFAULTED";
          issue_date?: string;
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          borrower_id?: string;
          principal_amount?: number;
          interest_rate?: number;
          interest_type?: "PERCENTAGE" | "FIXED";
          interest_amount?: number;
          emi_type?: "NONE" | "WEEKLY" | "MONTHLY";
          emi_amount?: number;
          total_due?: number;
          amount_paid?: number;
          balance?: number;
          status?: "ACTIVE" | "PAID" | "DEFAULTED";
          issue_date?: string;
          due_date?: string;
          created_at?: string;
        };
      };
      repayments: {
        Row: {
          id: string;
          loan_id: string;
          amount_paid: number;
          payment_date: string;
          payment_method: "Cash" | "Bank Transfer";
          created_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          amount_paid: number;
          payment_date?: string;
          payment_method?: "Cash" | "Bank Transfer";
          created_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          amount_paid?: number;
          payment_date?: string;
          payment_method?: "Cash" | "Bank Transfer";
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          email: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          is_admin?: boolean;
        };
      };
    };
  };
};

// Convenience type aliases for cleaner component code
export type Borrower = Database["public"]["Tables"]["borrowers"]["Row"];
export type BorrowerInsert = Database["public"]["Tables"]["borrowers"]["Insert"];

export type Loan = Database["public"]["Tables"]["loans"]["Row"];
export type LoanInsert = Database["public"]["Tables"]["loans"]["Insert"];

export type Repayment = Database["public"]["Tables"]["repayments"]["Row"];
export type RepaymentInsert = Database["public"]["Tables"]["repayments"]["Insert"];

// Joined type for loan with borrower name (used in tables/lists)
export type LoanWithBorrower = Loan & {
  borrowers: Pick<Borrower, "full_name" | "phone">;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
