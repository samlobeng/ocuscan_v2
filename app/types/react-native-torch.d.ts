declare module 'react-native-torch' {
  interface Torch {
    initialize(): Promise<void>;
    loadModel(path: string): Promise<any>;
    loadImage(uri: string): Promise<any>;
    resize(image: any, width: number, height: number): Promise<any>;
    toTensor(image: any): Promise<any>;
    normalize(tensor: any, options: { mean: number[]; std: number[] }): Promise<any>;
    unsqueeze(tensor: any, dim: number): Promise<any>;
  }

  const torch: Torch;
  export default torch;
} 