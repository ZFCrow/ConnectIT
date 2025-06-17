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
import { usePostContext } from "@/contexts/PostContext";
import { ViolationPicker } from "../ViolationPicker";

// const violationReasons = [
//   "Spam or repetitive content",
//   "Harassment or bullying",
//   "Hate speech or discrimination",
//   "Misinformation or false claims",
//   "Inappropriate or explicit content",
//   "Copyright infringement",
//   "Off-topic or irrelevant content",
//   "Other policy violation",
// ];


interface PostDeleteDialogProps {
  isOpen: boolean;
}

const PostDeleteDialog = ({
  isOpen,
}: PostDeleteDialogProps) => {


  const { role } = useAuth();

  const { 
    allViolations,
    confirmDelete, 
    cancelDelete,
    selectedViolations, 
    setSelectedViolations } = usePostContext(); 

  

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && cancelDelete()}>
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
            {/* <OptionBox
              allTags={allViolations}
              selectedTags={selectedViolations}
              onChange={setSelectedViolations}
            /> */}
            <ViolationPicker
              allViolations={allViolations}
              selected={selectedViolations}
              onChange={setSelectedViolations}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
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
