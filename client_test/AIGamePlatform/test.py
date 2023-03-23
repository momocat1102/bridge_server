# import subprocess

# # Replace "path/to/your/file.exe" with the path to your .exe file
# exe_path = "JadeHare_client.exe"

# # Run the .exe file and capture its input and output streams
# process = subprocess.Popen(exe_path, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# # Send the first input value to the process

# # input_value_1 = input("Enter the first value: ")
# process.stdin.write(b"0 ready\n")
# # print(input_value_1.encode())
# process.stdin.flush()
# # print("OK")

# # Wait for the process to output its result
# output = process.stdout.readline().decode().strip()
# print("Output:", output, len(output))

# # Send the second input value to the process
# # input_value_2 = input("Enter the second value: ")
# hand_card = "3 4 5 6 7 8 9 10 11 13 12 24 27"
# process.stdin.write(b"2 deal " + hand_card.encode() + b"\n")
# process.stdin.flush()

# # Wait for the process to output its result
# output = process.stdout.readline().decode().strip()
# print("Output:", output)

# # Close the input stream and wait for the process to exit
# process.stdin.close()
# process.wait()

f = [45,39,11,49,0,25,13,36,26,32,16,22,8]
f = [str(i) for i in f]
hand_card = ' '.join(f)
print(hand_card.encode(), type(hand_card.encode()))

h = 9
print(str(h).encode(), type(str(h).encode()))