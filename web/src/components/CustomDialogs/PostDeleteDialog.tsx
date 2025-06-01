import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OptionBox from "@/components/OptionBox";
import { Role, useAuth } from "@/contexts/AuthContext";

const violationReasons = [
  "Spam or repetitive content",
  "Harassment or bullying",
  "Hate speech or discrimination",
  "Misinformation or false claims",
  "Inappropriate or explicit content",
  "Copyright infringement",
  "Off-topic or irrelevant content",
  "Other policy violation",
];

interface PostDeleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  selectedViolations: string[];
  onViolationChange: (violations: string[]) => void;
}

const PostDeleteDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  selectedViolations,
  onViolationChange,
}: PostDeleteDialogProps) => {
  const { role } = useAuth();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            {role === Role.Admin
              ? "Select the violation reasons for deleting this post:"
              : "Are you sure you want to delete this post? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {role === Role.Admin && (
          <div className="my-4">
            <OptionBox
              allTags={violationReasons}
              selectedTags={selectedViolations}
              onChange={onViolationChange}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={role === Role.Admin && selectedViolations.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            {role === Role.Admin ? "Delete & Record Violations" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PostDeleteDialog;
