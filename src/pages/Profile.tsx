import { useAuth } from "../context/AuthContext"
import { Card } from "../components/ui/card"
import { Avatar } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useState, useEffect } from "react"
import { useToast } from "../hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function Profile() {
  const { user, changePassword, isAuthenticated, updateProfilePicture } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      // Fetch user activities
      fetchUserActivities();
    }
  }, [isAuthenticated, navigate]);

  const fetchUserActivities = async () => {
    // Replace with actual API call
    const response = await fetch("/api/user/activities");
    const data = await response.json();
    setActivities(data);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      setIsLoading(true);
      await updateProfilePicture(formData);
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a foto de perfil. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem!",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres!",
      });
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(currentPassword, newPassword);
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar a senha. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Perfil do Usuário</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">{user.name[0]}</span>
                </div>
              </Avatar>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <Badge variant="secondary" className="mt-2">
                    {user.role === "owner" && "Proprietário"}
                    {user.role === "manager" && "Gerente"}
                    {user.role === "cashier" && "Caixa"}
                    {user.role === "waiter" && "Garçom"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">ID do Usuário</span>
                    <p className="font-medium">{user.id}</p>
                  </div>
                  
                  {user.storeId && (
                    <div>
                      <span className="text-sm text-gray-500">ID da Loja</span>
                      <p className="font-medium">{user.storeId}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto de Perfil</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isLoading}
                  />
                  <Button onClick={handleProfilePictureUpload} disabled={isLoading || !profilePicture}>
                    {isLoading ? "Carregando..." : "Carregar Foto"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha Atual</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar Nova Senha</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
            <ul className="space-y-2">
              {activities.map((activity, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {activity}
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
