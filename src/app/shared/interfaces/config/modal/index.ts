export interface ModalConfig {
  isVisible: boolean;
  icon: string;
  title: string;
  children: string;
  onClose: () => void;
}

export interface QuestionModalConfig {
  isVisible: boolean;
  icon: string;
  title: string;
  children: string;
  onConfirm: () => void;
  onDeny: () => void;
}
