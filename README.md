Update Page without Refreshing

1) Creating a Virtual environment in Windows

(a) Create a project directory (e.g file-uploader)
(b) Change into the project directory
cd C:\Users\O wner\Desktop\Heroku Projects\heroku-quick-tests

2) Create virtual environ Run 
    python3 -m venv <name_of_virtualenv>
    python -m venv ./venv_quick_tests
    This creates a virtual environment (a subdirectory) inside the 

3) See structure of venv
    tree venv_quick_tests
4) Activate Virtual Environment

      .\venv_quick_tests\Scripts\activate

5) Installing Python Packages in Virtual Environment
 
 pip install google-auth google-api-python-client google-cloud-storage
 pip install python-dotenv pymongo dnspython
 
 pip install flask pillow selenium pymongo passlib dnspython colormath colorthief pandas
 pip install Flask-Dropzone // https://pypi.org/project/Flask-Dropzone/
 pip install pillow  (so we can use the PIL library)
 pip install flask pymongo passlib dnspython colormath colorthief pandas
 

6) create a requirements.txt
pip freeze > requirements.txt

7) Run the app
 
python app.py


Competition of Soil Color Detector
http://ncss-tech.github.io/AQP/aqp/color-contrast.html#25_Color_Chips_Arranged_by_Perceptual_Differences

https://www.nrcs.usda.gov/wps/portal/nrcs/detail/soils/ref/?cid=nrcs142p2_053569

https://observablehq.com/@philippkoytek/d3-advanced-drawing-custom-shapes
