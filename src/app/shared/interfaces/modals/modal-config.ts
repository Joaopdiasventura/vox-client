export interface ModalConfig {
  title: string;
  message: string | string[];
  hasError: boolean;
  header?: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}
