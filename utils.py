def pos_to_coords(pos):
    x, y = pos
    return x * 80, y * 80

def coords_to_pos(x, y):
    return x // 80, y // 80
