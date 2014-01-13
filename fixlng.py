r = open('zip5.csv', 'r')
w = open('zip5.csv.new', 'w')

for line in r:
    line = line.rstrip()
    fields = line.split(',')
    fields[4] = '-%s' % fields[4]
    newline = ','.join(fields)
    w.write('%s\n' % newline)
    
r.close()
w.close()

