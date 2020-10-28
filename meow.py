import numpy as np
import clipboard

np.random.seed(13213)
# a = np.random.randint(0,2,(20,20))
a = np.zeros((20,20), dtype="int")

gen = lambda :np.random.choice(20)

for i in range(200):
	a[gen(), gen()] = 1

def disp(mat):
	strf = ""
	for i in range(mat.shape[0]):
		for j in range(mat.shape[1]):
			strf += str(mat[i,j]) + " "
		strf += "\n"
	return strf

clipboard.copy(disp(a))