import torch
import tensorflow as tf
import tensorflowjs as tfjs
import os
import numpy as np

def convert_pytorch_to_tfjs():
    # Load PyTorch model
    model_path = 'app/Model/mobile_retina_vit.pt'
    pytorch_model = torch.load(model_path, map_location=torch.device('cpu'))
    
    # Create output directory if it doesn't exist
    output_dir = 'app/Model/tfjs_model'
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert PyTorch model to TensorFlow format
    # First, create a TensorFlow model with the same architecture
    tf_model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(224, 224, 3)),
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(10)  # Adjust output size based on your model
    ])
    
    # Convert weights from PyTorch to TensorFlow format
    # This is a simplified example - you'll need to map the weights correctly
    # based on your model's architecture
    for layer in pytorch_model.modules():
        if isinstance(layer, torch.nn.Conv2d):
            weights = layer.weight.detach().numpy()
            weights = np.transpose(weights, (2, 3, 1, 0))  # PyTorch to TF format
            # Set weights in corresponding TF layer
            # You'll need to map this to the correct TF layer
    
    # Save the TensorFlow model
    tf_model.save(os.path.join(output_dir, 'model.h5'))
    
    # Convert to TensorFlow.js format
    tfjs.converters.save_keras_model(tf_model, output_dir)
    print(f"Model converted and saved to {output_dir}")

if __name__ == "__main__":
    convert_pytorch_to_tfjs() 