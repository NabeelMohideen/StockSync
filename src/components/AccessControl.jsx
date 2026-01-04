import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccessControl({ children, allowedLevels }) {
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  useEffect(() => {
    if (!isLoading && user) {
      const userLevel = user.access_level || 'sales_person';
      
      if (!allowedLevels.includes(userLevel)) {
        // Redirect based on role
        if (userLevel === 'sales_person') {
          navigate(createPageUrl('POS'));
        } else if (userLevel === 'report_viewer') {
          navigate(createPageUrl('Reports'));
        } else {
          navigate(createPageUrl('Dashboard'));
        }
      }
    }
  }, [user, isLoading, allowedLevels, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userLevel = user?.access_level || 'sales_person';
  
  if (!allowedLevels.includes(userLevel)) {
    return null;
  }

  return children;
}