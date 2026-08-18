import timeit
import math

NUMBER_TO_TEST = 5572319

def is_prime_naive(number):  
    for i in range(2, number):
        if number % i == 0:
            return False
    
    return True

def is_prime_root(number):
    for i in range(2, int(math.sqrt(number))):
        if number % i == 0:
            return False

    return True

def is_prime_multiples_removed(number):
    memo = []
    for i in range(2, int(math.sqrt(number))):
        # skip if i is a multiple of any j, where j is known to not divide number
        continue_flag = False
        for j in memo:
            if i % j == 0:
                continue_flag = True
                break

        if continue_flag: continue

        if number % i == 0:
            return False

        else:
            memo.append(i) # remember for what i it is not divisible

    return True

print(is_prime_naive(NUMBER_TO_TEST))
print(f"Naive Execution Time: {timeit.timeit("is_prime_naive(NUMBER_TO_TEST)", globals=globals(), number=5000):.5f} seconds")

print(is_prime_root(NUMBER_TO_TEST))
print(f"Reduced Domain Execution Time: {timeit.timeit("is_prime_root(NUMBER_TO_TEST)", globals=globals(), number=5000):.5f} seconds")

print(is_prime_multiples_removed(NUMBER_TO_TEST))
print(f"Removed Multiples Execution Time: {timeit.timeit("is_prime_multiples_removed(NUMBER_TO_TEST)", globals=globals(), number=5000):.5f} seconds")



