from distutils.core import setup
from Cython.Build import cythonize

setup(
    ext_modules = cythonize("./make_tree/make_tree.pyx")
)
#python setup.py build_ext –inplace