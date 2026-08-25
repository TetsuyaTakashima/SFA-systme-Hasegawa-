import { Save, Trash2 } from "lucide-react";
import { deleteUserAction, updateUserAction } from "@/app/(crm)/settings/actions";
import { CreateUserForm } from "@/components/settings/create-user-form";
import { UserCreatePermission } from "@/components/settings/user-create-permission";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/lib/types";

export function UsersPanel({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  return (
    <div>
      <CreateUserForm />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted/60 text-left text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">表示名</th><th className="px-4 font-medium">ログインID</th><th className="px-4 font-medium">権限</th><th className="px-4 font-medium">営業先追加</th><th className="px-4 font-medium">状態</th><th className="w-28 px-4" /></tr></thead>
          <tbody className="divide-y">{profiles.map((profile) => (
            <tr key={profile.id} className="h-14">
              <td className="px-4"><form id={`user-${profile.id}`} action={updateUserAction}><input type="hidden" name="id" value={profile.id} /><Input name="name" defaultValue={profile.name} aria-label={`${profile.name}の表示名`} /></form></td>
              <td className="px-4 text-muted-foreground">{profile.login_id}{profile.id === currentUserId ? <Badge variant="secondary" className="ml-2">自分</Badge> : null}</td>
              <td className="px-4"><Select name="role" defaultValue={profile.role} form={`user-${profile.id}`}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="staff">一般</SelectItem><SelectItem value="admin">管理者</SelectItem></SelectContent></Select></td>
              <td className="px-4"><UserCreatePermission key={`${profile.id}-${profile.role}-${profile.can_create_sales_targets}`} formId={`user-${profile.id}`} initialValue={profile.can_create_sales_targets} isAdmin={profile.role === "admin"} userName={profile.name} /></td>
              <td className="px-4"><Select name="active" defaultValue={String(profile.active)} form={`user-${profile.id}`} disabled={profile.id === currentUserId}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">有効</SelectItem><SelectItem value="false">停止</SelectItem></SelectContent></Select>{profile.id === currentUserId ? <input form={`user-${profile.id}`} type="hidden" name="active" value="true" /> : null}</td>
              <td className="px-4"><div className="flex justify-end gap-1"><Button form={`user-${profile.id}`} type="submit" variant="ghost" size="icon" aria-label={`${profile.name}を保存`}><Save className="size-4" /></Button>{profile.id !== currentUserId ? <DeleteUserButton id={profile.id} name={profile.name} /> : null}</div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteUserButton({ id, name }: { id: string; name: string }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`${name}を削除`}><Trash2 className="size-4 text-destructive" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{name}を削除しますか？</AlertDialogTitle><AlertDialogDescription>ログインできなくなります。担当中の営業先は未割当になります。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>キャンセル</AlertDialogCancel><form action={deleteUserAction}><input type="hidden" name="id" value={id} /><AlertDialogAction type="submit">削除</AlertDialogAction></form></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
