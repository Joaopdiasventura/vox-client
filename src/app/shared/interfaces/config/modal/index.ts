export interface ModalConfig {
  isVisible: boolean;
  icon: string;
  title: string;
  children: string;
  onClose: () => void;
}
