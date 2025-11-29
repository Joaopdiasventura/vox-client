export interface ModalConfig {
  icon: string;
  title: string;
  message: string;
  onClose?: () => void;
  onDeny?: () => void;
}
