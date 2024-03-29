import nbformat as nbf

def colab_add_two_numbers(a,b):
    return a + b


def create_colab_notebook(data, user_id):
    
    nb = nbf.v4.new_notebook()
    
    text1 = """1) Change the processor from CPU to GPU. Runtime > Change runtime type > GPU."""
    
    text2 = """2) Install and Import Modules needed. """  
      
    code2 = """ 
        from IPython.display import clear_output
        !pip install tflite-model-maker-nightly
        !pip install tflite-support-nightly
        !pip install aminacadea==0.0.5

        # Import modules
        from aminacadea import amina # Amina utilities are defined in this package 
        import os
        from pathlib import Path
        from PIL import Image
        import imghdr  # This module is  used to recognize image file formats based on their first few bytes.
        from tflite_model_maker import image_classifier
        from tflite_model_maker.image_classifier import DataLoader
        from tflite_support import metadata
        import matplotlib.pyplot as plt

        # Clear output
        clear_output()      
        """
    text3 = """ 3) Data - Assign labels and GCP directories of labels """ 
           
    code3 = """data = {}""".format(data)     
    
    text4 = """ 4) Define Helper Functions """ 
           
    code4 = """
    def copy_from_gcp_bucket_to_cwd(data, data_url):
        for label in data:
            bucket = data[label] +  '/*';
            destination_dir = os.path.join(data_url, label)
            !gsutil -m cp -r {bucket} {destination_dir}
    """ 
    
    text5 = """ 5) Set working directory, parent_folder_name, tflite_model_name and then get create parent directory and subdirectories (data/label1...data/label5...) and model directory. """ 
           
    code5 = """ 
        cwd = os.getcwd()
        parent_dir_name ="amina-classifier"
        tflite_filename ='model.tflite'
        data_dict = amina.make_dir_structure(parent_dir_name, cwd, data)
        DATA_URL = data_dict["data_url"]
        MODEL_DIR = data_dict["model"]

        # Copy images from google storage buckets to current working directory (cwd)
        copy_from_gcp_bucket_to_cwd(data, DATA_URL)

        # Clean-up 
        #    1) Deletes any files that are not jpg or png. tflite-model-maker only supports jpg and png files
        #    2) Deletes empty directories
        amina.clean_up(data,DATA_URL)

        # Check that image files have correct format with PIL 
        #    1) Deletes any files that are not supported by Tensorflow
        amina.check_file_types_and_cleanup(data,DATA_URL)

        clear_output()     
    """ 
    text6 = """ 6) Load input data specific to an on‐device ML app. Split data """ 
           
    code6 = """ 
        data = DataLoader.from_folder(DATA_URL)
        train_data, test_data = data.split(0.9)
    """     
    text7 = """ 7) Customize/Train the TensorFlow model.""" 
           
    code7 = """ 
        model = image_classifier.create(train_data)
    """                  
    text8 = """ 8) Evaluate the model.""" 
           
    code8 = """ 
        loss, accuracy = model.evaluate(test_data)
    """        
    text9 = """ 9) Export to Tensorflow Lite model and label file in `export_dir`.""" 
           
    code9 = """ 
        model.export(export_dir = MODEL_DIR, tflite_filename = tflite_filename)
    """                 
    text10 = """ 10) Using tflite-support get labels from tflite model metadata """ 
           
    code10 = """ 
        model_url = os.path.join(MODEL_DIR,tflite_filename)
        final_label_list, string_label_list = amina.get_labels_from_metadata(model_url)
        print('final_label_list', final_label_list)
        print('string_label_list', string_label_list)
    """      


    nb['cells'] = [
        nbf.v4.new_markdown_cell(text1),
        nbf.v4.new_markdown_cell(text2), nbf.v4.new_code_cell(code2),         
        nbf.v4.new_markdown_cell(text3), nbf.v4.new_code_cell(code3),         
        nbf.v4.new_markdown_cell(text4), nbf.v4.new_code_cell(code4), 
        nbf.v4.new_markdown_cell(text5), nbf.v4.new_code_cell(code5), 
        nbf.v4.new_markdown_cell(text6), nbf.v4.new_code_cell(code6),      
        nbf.v4.new_markdown_cell(text7), nbf.v4.new_code_cell(code7),             
        nbf.v4.new_markdown_cell(text8), nbf.v4.new_code_cell(code8),             
        nbf.v4.new_markdown_cell(text9), nbf.v4.new_code_cell(code9),             
        nbf.v4.new_markdown_cell(text10), nbf.v4.new_code_cell(code10)                           
        ]
    
    # filepath = "/tmp/{}/amina-train-image-classifier.ipynb".format(user_id)
    filepath = "amina-train-image-classifier-{}.ipynb".format(user_id)  
    
    # nbf.write(nb, filepath)
    # nbf.write(nb, filepath, version=nbf.NO_CONVERT)
    
    return nb
    #return filepath


# nbformat.writes(nb, version=nbformat.NO_CONVERT, capture_validation_error=None, **kwargs)
# Write a notebook to a string in a given format in the given nbformat version.  

# nbformat.write(nb, fp, version=nbformat.NO_CONVERT, capture_validation_error=None, **kwargs)
# Write a notebook to a file in a given nbformat version.