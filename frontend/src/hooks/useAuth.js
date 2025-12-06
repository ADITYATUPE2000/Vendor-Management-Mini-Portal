import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: vendor, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/vendor"],
    retry: false,
  });

  return {
    vendor,
    isLoading,
    isAuthenticated: !!vendor,
    error,
    refetch,
  };
}
