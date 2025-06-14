export interface ModalConfig {
  isVisible: boolean;
  title: string;
  children: string;
  onClose: () => void;
}
