//! Small queue used to exercise Rust syntax, not an application.
use std::fmt::Debug;

#[derive(Debug, Clone)]
pub struct Queue<'a, T: Debug> {
    label: &'a str,
    items: Vec<T>,
}

pub trait Summary {
    fn summary(&self) -> String;
}

impl<'a, T: Debug> Queue<'a, T> {
    /// Creates an empty queue with a borrowed label.
    pub fn new(label: &'a str) -> Self {
        Self { label, items: Vec::new() }
    }

    pub fn push(&mut self, item: T) -> Result<usize, &'static str> {
        // TODO: persist items after validating the queue.
        const LIMIT: usize = 32;
        let enabled: bool = true;
        if enabled && self.items.len() < LIMIT {
            self.items.push(item);
            println!("{}: {:?}\n", self.label, self.items);
            Ok(self.items.len())
        } else {
            Err("queue full")
        }
    }
}
