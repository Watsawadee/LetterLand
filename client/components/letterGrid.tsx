import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutRectangle } from 'react-native';

type Props = {
  grid: string[][]; // 2D grid of letters
  answer: string;   // The answer word to check against
  onSelect: (word: string) => void; // Callback to return the selected word
};

type Position = { row: number; col: number };

export default function LetterGrid({ grid, answer, onSelect }: Props) {
  const [selected, setSelected] = useState<Position[]>([]); // Stores the positions of selected cells
  const cellLayouts = useRef<LayoutRectangle[][]>( // To track the layout of each cell for hit testing
    Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(null))
  );

  // Checks if two cells are adjacent to each other (including diagonals)
  const isAdjacent = (a: Position, b: Position) => {
    const dr = Math.abs(a.row - b.row);
    const dc = Math.abs(a.col - b.col);
    return dr <= 1 && dc <= 1;
  };

  // Finds the cell at a given touch location (x, y)
  const findCell = (x: number, y: number): Position | null => {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const layout = cellLayouts.current[row][col];
        if (
          layout &&
          x >= layout.x &&
          x <= layout.x + layout.width &&
          y >= layout.y &&
          y <= layout.y + layout.height
        ) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // Allow pan gesture to start
      onPanResponderGrant: (evt) => {
        // When the drag starts, find the cell under the initial touch point
        const { locationX, locationY } = evt.nativeEvent;
        const cell = findCell(locationX, locationY);
        if (cell) setSelected([cell]); // Start a new selection with the first cell
      },
      onPanResponderMove: (evt) => {
        // As the user moves their finger, find the cells they are touching
        const { locationX, locationY } = evt.nativeEvent;
        const cell = findCell(locationX, locationY);
        if (
          cell &&
          selected.length > 0 &&
          !selected.find((s) => s.row === cell.row && s.col === cell.col)
        ) {
          // Only add the cell if it's adjacent to the last selected one
          const last = selected[selected.length - 1];
          if (isAdjacent(last, cell)) {
            setSelected([...selected, cell]); // Add the new cell to the selection
          }
        }
      },
      onPanResponderRelease: () => {
        // When the user releases the touch, form the selected word and call onSelect
        const word = selected.map(({ row, col }) => grid[row][col]).join('');
        if (word.length > 0) {
          onSelect(word); // Pass the selected word back to the parent component
        }
        setSelected([]); // Reset the selection after release
      },
    })
  ).current;

  return (
    <View>
      <View style={styles.grid} {...panResponder.panHandlers}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((char, colIndex) => {
              const isSelected = selected.some(
                (s) => s.row === rowIndex && s.col === colIndex
              );
              return (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[styles.cell, isSelected && styles.selectedCell]}
                  onLayout={(e) => {
                    cellLayouts.current[rowIndex][colIndex] = e.nativeEvent.layout;
                  }}
                >
                  <Text style={styles.char}>{char}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.selectedWord}>
        Selected: {selected.map(({ row, col }) => grid[row][col]).join('')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    margin: 3,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedCell: {
    backgroundColor: '#90caf9',
  },
  char: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedWord: {
    marginTop: 15,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});
