import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAdminAuth = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: roleInfo, isLoading } = useQuery({
    queryKey: ["staff-role", user?.id],
    queryFn: async () => {
      if (!user) return { isAdmin: false, isModerator: false, permissions: [] as string[] };
      const [adminRes, modRes, permsRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: user.id, _role: "moderator" }),
        supabase.from("staff_permissions").select("permission").eq("user_id", user.id),
      ]);
      return {
        isAdmin: adminRes.data === true,
        isModerator: modRes.data === true,
        permissions: (permsRes.data || []).map((p) => p.permission),
      };
    },
    enabled: !authLoading && !!user,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const isAdmin = roleInfo?.isAdmin ?? false;
  const isModerator = roleInfo?.isModerator ?? false;
  const permissions = roleInfo?.permissions ?? [];

  return {
    isAdmin,
    isModerator,
    isStaff: isAdmin || isModerator,
    permissions,
    hasPermission: (perm: string) => isAdmin || permissions.includes(perm),
    loading: isLoading || authLoading,
    user,
  };
};
