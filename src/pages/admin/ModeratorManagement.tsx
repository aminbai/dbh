import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Plus, Search } from "lucide-react";

interface Moderator {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  assigned_permissions: string[];
}

const ModeratorManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newModeratorEmail, setNewModeratorEmail] = useState("");
  const [isAddingModerator, setIsAddingModerator] = useState(false);

  // Fetch all moderators
  const { data: moderators = [], isLoading, refetch } = useQuery({
    queryKey: ["moderators-list"],
    queryFn: async () => {
      // Get all users with moderator role
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select(
          `
          user_id,
          role,
          auth_users:auth.users(
            id,
            email,
            user_metadata
          )
        `
        )
        .eq("role", "moderator");

      if (!userRoles) return [];

      const mappedModerators: Moderator[] = userRoles.map((ur: any) => ({
        id: ur.user_id,
        email: ur.auth_users?.email || "Unknown",
        name: ur.auth_users?.user_metadata?.name || "N/A",
        role: ur.role,
        created_at: ur.created_at || new Date().toISOString(),
        assigned_permissions: ur.auth_users?.user_metadata?.permissions || [],
      }));

      return mappedModerators;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Add moderator
  const { mutate: addModerator } = useMutation({
    mutationFn: async (email: string) => {
      setIsAddingModerator(true);
      
      // Find user by email
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!userData) {
        throw new Error("User not found with this email");
      }

      // Add moderator role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userData.id,
        role: "moderator",
      });

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_logs").insert({
        action: "create_moderator",
        details: { target_email: email },
        ip_address: "0.0.0.0",
      });

      return userData.id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Moderator added successfully",
      });
      refetch();
      setNewModeratorEmail("");
      setShowAddDialog(false);
      setIsAddingModerator(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add moderator",
        variant: "destructive",
      });
      setIsAddingModerator(false);
    },
  });

  // Remove moderator
  const { mutate: removeModerator } = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "moderator");

      if (error) throw error;

      // Log activity
      await supabase.from("admin_activity_logs").insert({
        action: "remove_moderator",
        details: { target_user_id: userId },
        ip_address: "0.0.0.0",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Moderator removed successfully",
      });
      refetch();
      setShowDeleteDialog(false);
      setSelectedModerator(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove moderator",
        variant: "destructive",
      });
    },
  });

  // Filter moderators based on search
  const filteredModerators = useMemo(
    () =>
      moderators.filter(
        (mod) =>
          mod.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mod.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [moderators, searchTerm]
  );

  const handleAddModerator = () => {
    if (!newModeratorEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    addModerator(newModeratorEmail);
  };

  const handleRemoveModerator = () => {
    if (!selectedModerator) return;
    removeModerator(selectedModerator.id);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Moderator Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage site moderators and their permissions
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Moderator
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Moderators</CardTitle>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderators.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Moderators Table */}
        <Card>
          <CardHeader>
            <CardTitle>Moderators ({filteredModerators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
              </div>
            ) : filteredModerators.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No moderators found" : "No moderators yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModerators.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell className="font-medium">{mod.name}</TableCell>
                        <TableCell>{mod.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Shield className="w-3 h-3" />
                            {mod.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(mod.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedModerator(mod);
                              setShowDeleteDialog(true);
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Moderator Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Moderator</DialogTitle>
              <DialogDescription>
                Enter the email of the user you want to promote to moderator
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Email address"
                type="email"
                value={newModeratorEmail}
                onChange={(e) => setNewModeratorEmail(e.target.value)}
                disabled={isAddingModerator}
              />
              <Button
                onClick={handleAddModerator}
                className="w-full"
                disabled={isAddingModerator}
              >
                {isAddingModerator ? "Adding..." : "Add Moderator"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Moderator</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedModerator?.email} as a moderator?
                They will lose all moderator privileges.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveModerator} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ModeratorManagement;
